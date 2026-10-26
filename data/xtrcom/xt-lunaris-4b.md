# XtrCom/XT-Lunaris-4B

## Resumen

XT-Lunaris-4B es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.5-4B, desarrollado por XtrCom, cuyo objetivo declarado es convertir el modelo base en el denominado «asistente XT»: un modelo con razonamiento largo y estructurado, un registro conversacional humano y una política entrenada de confirmación antes de ejecutar acciones destructivas. El proyecto se apoya en un adaptador LoRA sobre el modelo base, que cuenta con 4.210 millones de parámetros, 32 capas, un vocabulario de 248.320 tokens y una arquitectura híbrida de Gated DeltaNet más atención con compuertas.

El dato más importante para cualquier evaluador es que **el repositorio no contiene pesos**. La model card es un borrador declarado explícitamente («DRAFT CARD, NO WEIGHTS YET»): el entrenamiento está pausado en el paso 150 de 752 y no se ha subido ni el adaptador ni ningún checkpoint fusionado. El adaptador del paso 150 existe pero el autor ha decidido no publicarlo porque su señal de entrenamiento era incorrecta, tal como se detalla más abajo.

Por tanto, esta ficha documenta un proyecto en estado de diseño y ejecución parcial, no un modelo utilizable. Su interés ahora mismo es metodológico: publica la configuración exacta del entrenamiento, el conjunto de datos, el fallo de enmascaramiento detectado y un protocolo de evaluación con controles frente al modelo base, lo cual es poco habitual en fine-tunes de este tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: Gated DeltaNet con compuertas más atención con compuertas (arquitectura del modelo base Qwen/Qwen3.5-4B) |
| Parametros totales | 4,21 mil millones (4.21B) en el modelo base; el adaptador LoRA no añade parámetros en inferencia tras la fusión |
| Parametros activos | No aplica: el modelo base es denso, no es un MoE |
| Longitud de contexto | 262.144 tokens nativos en el modelo base; el entrenamiento del fine-tune se ha configurado a 2.048 tokens |
| Tipos de cuantizacion | No disponible: no hay pesos publicados. El autor probó QLoRA de 4 bits y lo descartó por medición (explosión de activaciones a 4k de contexto) |
| Idiomas soportados | No disponible (el campo de idiomas del repositorio no está rellenado) |
| Licencia | CC-BY-4.0 para la model card y la compilación; el modelo base Qwen/Qwen3.5-4B es Apache-2.0 y los pesos derivados deben cumplirla también |
| Formato de pesos | No disponible: no se ha publicado ningún checkpoint ni adaptador. La librería declarada es transformers |

Otros datos del repositorio: pipeline `text-generation`, tags `xt-lunaris`, `qwen3.5`, `lora`, `reasoning`, `long-context`, `in-training`, `endpoints_compatible`, `region:us`. Creado el 26 de octubre de 2026, con 0 descargas y 0 likes en el momento de la consulta. Versión de la card: 2.4.0-Lunaris.

## Arquitectura y entrenamiento

El modelo base es Qwen/Qwen3.5-4B: 4,21B de parámetros, 32 capas, vocabulario de 248.320 tokens y una disposición híbrida de Gated DeltaNet más atención con compuertas, con 262.144 tokens de contexto nativo. Sobre esa base se aplica un adaptador LoRA con r=64, alpha=128, dropout 0,05 y objetivos en todas las capas lineales, manteniendo el modelo base en bf16 (precisión completa de entrenamiento) tras rechazar QLoRA de 4 bits por medición. La configuración de entrenamiento registrada incluye contexto de 2.048 tokens, `batch_tokens` de 2.048 con acumulación de gradiente de 4 y agrupación por longitud, optimizador AdamW con lr 1e-4, decaimiento coseno, 20 pasos de calentamiento, betas 0,9/0,95, sin weight decay y semilla 20261017. El entrenamiento corre en una NVIDIA L4 de 22 GB con un pico asignado de 15,55 GB y un rendimiento medido de aproximadamente 983 tokens por segundo.

Los datos proceden de `XtrCom/XT-Research-FT-Dataset` (CC-BY-4.0), con 50.646 filas y 48,80 millones de tokens medidos, construido a partir de fuentes públicas con atribución por fuente. La ejecución actual usa una porción concreta, `focus_2k`, de 10.180 filas y 6,15 millones de tokens, con código excluido y peso incrementado en razonamiento y en el registro conversacional. El plan de entrenamiento contempla SFT seguido de RL, y la eficiencia debe venir del entrenamiento, no de truncar el razonamiento en tiempo de servicio.

El proyecto documenta un defecto técnico relevante: con la opción `--mask-no-think`, cualquier turno del asistente sin bloque de razonamiento devolvía una fila de etiquetas totalmente enmascarada por un retorno temprano que nunca alcanzaba el camino alternativo. Como resultado, 5.429 de las 10.180 filas de `focus_2k` produjeron cero tokens supervisados, de modo que cerca de la mitad de los datos de voz y prosa no entrenaron nada y las medias de pérdida cero/0 generaron ventanas de NaN en el registro. La corrección planteada enmascara únicamente los bloques de razonamiento vacíos, entrena con normalidad los turnos sin razonamiento y descarta en la construcción del dataset las filas sin señal, con recuento. Existen comprobaciones de comportamiento para esa corrección.

## Capacidades

Las siguientes capacidades son el objetivo declarado del ajuste fino; no pueden verificarse porque no hay pesos publicados.

- Razonamiento largo y estructurado generado en la propia salida del modelo, sin límite impuesto en tiempo de inferencia.
- Registro conversacional «humanizado»: lenguaje llano, sin coletillas corporativas ni hedges de plantilla.
- Política entrenada y medida de confirmación antes de acciones destructivas o irreversibles (comportamiento con puerta o *gate* explícito).
- Generación de texto generalista heredada del modelo base Qwen3.5-4B.
- Capacidad potencial de contexto largo (hasta 262.144 tokens nativos del modelo base), aunque el ajuste fino se ha entrenado solo a 2.048 tokens y el entrenamiento a 4k y 8k está bloqueado.
- Soporte de tool calling y function calling: no documentado en la información disponible.
- Capacidades multimodales (visión, audio): no documentadas; el pipeline declarado es únicamente `text-generation`.
- Capacidades multilingües: no disponibles; el campo de idiomas del repositorio está vacío.

## Casos de uso

Ninguno de estos casos es ejecutable hoy, ya que no existe checkpoint distribuible. Se enumeran como casos objetivo una vez se publique una versión corregida.

- Asistente conversacional de atención al cliente: el registro llano y sin coletillas que se busca entrenar reduciría la fricción en conversaciones multi-turno, y los 262.144 tokens nativos del modelo base permitirían arrastrar historial e información de cuenta sin recortes agresivos.
- Agentes con acciones irreversibles (aprovisionamiento de infraestructura, borrado de recursos, envío de correos masivos): la política de confirmación previa actuaría como salvaguarda a nivel de modelo, complementaria a las comprobaciones del orquestador.
- Copiloto de operaciones con razonamiento explícito: al generarse el razonamiento en la salida, los equipos de guardia pueden auditar la cadena de decisión en lugar de recibir solo la acción final.
- Generación de documentación técnica y textos de producto: el objetivo de «voz humana» encaja en redacción de material de cara al usuario donde el tono corporativo resulta contraproducente.
- Evaluación comparativa de técnicas de ajuste: el repositorio publica configuración, dataset, métricas de hardware y un protocolo de evaluación con controles bf16 y Q4 del modelo base, lo que lo hace útil como referencia metodológica para otros equipos.
- Base para experimentos de razonamiento con contexto largo: una vez resuelto el bloqueo de cuota de GPU y la necesidad de entropía cruzada por trozos para el tensor de logits de 248.320 tokens, el modelo serviría para estudiar degradación de razonamiento a 4k y 8k.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor describe un protocolo de evaluación (batería de sondas sobre voz, estructura, honestidad, comportamiento de rechazo y la política de confirmación antes de acciones destructivas; matriz de cinco modelos que incluye controles del modelo base en bf16 y en Q4; y puertas de capacidad que exigen no degradar razonamiento ni código respecto a la base), pero no se ha publicado ningún resultado numérico del mismo.

El único dato de rendimiento medido que aparece es de entrenamiento, no de inferencia: aproximadamente 983 tokens por segundo en una NVIDIA L4 de 22 GB, con 15,55 GB de pico asignado, a 2.048 tokens de contexto.

## Requisitos de hardware

Las cifras de esta sección son estimaciones derivadas del tamaño del modelo base (4,21B de parámetros) y no mediciones del modelo ajustado, que no existe. Se marcan como tales.

- Pesos en bf16: aproximadamente 8,4 GB solo de pesos; con caché KV a contextos largos, el consumo real supera con holgura los 10-12 GB.
- Cuantización de 8 bits: aproximadamente 4,2 GB de pesos.
- Cuantización de 4 bits (Q4_K_M o similar): aproximadamente 2,5-2,7 GB de pesos; opción realista para GPU de consumo.
- GPU de consumo: una RTX 4090 (24 GB) albergaría bf16 con contexto moderado; una RTX 3060 de 12 GB o una RTX 4060 Ti de 16 GB quedarían limitadas a 8 o 4 bits.
- GPU de servidor: A100 40/80 GB, H100 o L40S para servicio en bf16 con contexto largo y concurrencia. El propio autor ha usado una L4 de 22 GB para el ajuste fino, no para servicio.
- Entrenamiento: LoRA a 2.048 tokens cabe en 22 GB (15,55 GB medidos). El salto a 4k y 8k está bloqueado por cuota de GPU: el tensor de logits del vocabulario de 248.320 tokens exige entropía cruzada por trozos para que 8k quepa en 22 GB.
- Opciones de despliegue: vLLM o TGI para servicio en bf16; llama.cpp u Ollama requerirían conversión a GGUF que no está disponible. El repositorio incluye el tag `endpoints_compatible`, lo que sugiere compatibilidad con la infraestructura de endpoints de Hugging Face, aunque sin pesos no es verificable.
- Latencia y throughput de inferencia: no disponibles. El valor de 983 tok/s corresponde al entrenamiento y no es extrapolable al servicio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado y disponibilidad |
|---|---|---|---|---|
| XT-Lunaris-4B | 4,21B (base) + adaptador LoRA | 262.144 nativo en la base; entrenado a 2.048 | CC-BY-4.0 (card) + Apache-2.0 (base) | Borrador sin pesos; entrenamiento pausado en el paso 150 de 752 |
| Qwen/Qwen3.5-4B (modelo base) | 4,21B | 262.144 nativo | Apache-2.0 | Pesos publicados y utilizables; referencia de control del propio autor |
| XT-Luna 1B (mismo autor) | 1B | 8.192 según la ficha de terceros consultada | No disponible | Publicado (v1), orientado a cargas agénticas y de código |

No se dispone de datos verificados de otros fine-tunes del mismo modelo base que permitan una comparación de rendimiento. La comparación con la base es la única significativa: cualquier ganancia del ajuste debe medirse contra los controles bf16 y Q4 del Qwen3.5-4B, y esos resultados aún no se han publicado.

## Limitaciones y advertencias

- No hay modelo utilizable. El propio autor indica que nada en el repositorio debe tratarse como un checkpoint funcional. Cualquier descarga o integración es imposible a día de hoy.
- El adaptador del paso 150 existe pero no se publica: su señal de entrenamiento era incorrecta por el defecto de enmascaramiento, con 5.429 de 10.180 filas sin tokens supervisados.
- El ajuste se ha entrenado a 2.048 tokens, muy por debajo de los 262.144 nativos del modelo base. El comportamiento en contextos largos no está entrenado ni evaluado y probablemente degrade.
- El entrenamiento a 4k y 8k está bloqueado por cuota de GPU y por la necesidad de entropía cruzada por trozos para el vocabulario de 248.320 tokens.
- Idiomas soportados no declarados. No se puede asumir un rendimiento multilingüe, en particular en castellano.
- No hay resultados de benchmarks publicados. La evaluación descrita es un protocolo, no evidencia empírica.
- El experimento de ablación (eliminación de la dirección de rechazo) sobre el estudio hermano con MiniCPM5-2B dio un resultado negativo relevante: la dirección de rechazo se identifica causalmente, pero el comportamiento no la sigue, con aumento de rechazos benignos y p=0,006. El autor concluye que el rechazo debe tratarse con datos y RL, no con ablación.
- La licencia CC-BY-4.0 cubre la card y la compilación; los pesos derivados quedan además sujetos a Apache-2.0 del modelo base y a los términos por fuente del dataset original. Cualquier uso comercial debe verificar ambas capas.
- El dataset se construye a partir de fuentes públicas con atribución por fuente; los términos de cada fuente se preservan y pueden imponer restricciones adicionales.
- Señales de madurez del repositorio: 0 descargas, 0 likes y un campo de idiomas sin rellenar. No hay evidencia de uso en producción por parte de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/XtrCom/XT-Lunaris-4B
- Repositorio de checkpoints del proyecto: https://huggingface.co/XtrCom/xt-lunaris-checkpoints
- Modelo base Qwen/Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset referenciado en la card, XtrCom/XT-Research-FT-Dataset: https://huggingface.co/datasets/XtrCom/XT-Research-FT-Dataset
- Cuenta del autor en X: https://x.com/XtrCom_
- Ficha de terceros de XT-Luna 1B (modelo hermano): https://free2aitools.com/model/xtrcom/xt-luna-1b
- Articulo sobre XT-Luna 1B: https://agihunt.info/en/p/1a14ab416fedfa2dbd061ca41ed
