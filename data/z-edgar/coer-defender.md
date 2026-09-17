# Z-Edgar/CoER-Defender

## Resumen

CoER-Defender (etiquetado internamente como CoER Defender SFT360) es un ajuste fino de Qwen3.5-9B desarrollado por el usuario Z-Edgar como artefacto de investigacion asociado al articulo CoER: Defending against Adaptive Indirect Prompt Injection via Adversarial Co-Evolution and Refinement (arXiv:2609.07529). Su proposito es actuar como "defensor" frente a ataques de inyeccion indirecta de prompts en entornos agénticos: el modelo recibe interacciones de texto y llamadas a herramientas y debe completar la tarea sin obedecer instrucciones maliciosas incrustadas en contenido de terceros.

El pipeline descrito en la model card consta de tres etapas (Attacker SFT, Co-PPO bilateral y Defender SFT guiado por poblacion). El checkpoint publicado es la actualizacion 360 de un trabajo configurado para dos epocas y 720 actualizaciones, con pesos en BF16 y configuracion `Qwen3_5ForConditionalGeneration` / `qwen3_5`. Los datos de supervision proceden de 5.760 trayectorias seguras y exitosas en la tarea, de las cuales 4.907 corresponden a ejemplos atacados y 853 a replicas no disparadas.

Su relevancia es doble: por un lado aborda un problema de seguridad poco cubierto (inyeccion indirecta adaptativa en agentes con herramientas); por otro, es un artefacto de investigacion explicitamente no certificado para produccion, con licencia pendiente de confirmacion y sin resultados reproducidos de forma independiente. La transferencia de pesos estaba en curso en el momento de publicacion del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con generacion condicional (`Qwen3_5ForConditionalGeneration`, configuracion `qwen3_5`); la model card no detalla si emplea atencion lineal, MoE u otras variantes |
| Parametros totales | Aproximadamente 9.000 millones, inferido del identificador de la familia base Qwen3.5-9B; no verificado de forma independiente |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; los pesos publicados estan en BF16 y no se listan versiones GGUF, AWQ, GPTQ ni similares |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible; la licencia del artefacto final y los permisos de redistribucion estan pendientes de confirmacion por el propietario. La licencia Apache-2.0 de la familia base Qwen3.5-9B se conserva en `UPSTREAM_LICENSE`, lo que no resuelve los derechos sobre pesos ajustados, datos de entrenamiento ni salidas del profesor |
| Formato de pesos | safetensors (BF16), con tokenizer JSON, shard index y ficheros de configuracion asociados |
| Modelo base | Qwen/Qwen3.5-9B (relacion: finetune) |
| Libreria | transformers (el checkpoint registra Transformers 5.3.0 como procedencia, no como dependencia probada) |
| Repositorio | Z-Edgar/CoER-Defender (0 descargas, 0 likes en el momento del analisis) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de la familia Qwen3.5-9B, un transformer de generacion condicional orientado a chat y uso de herramientas, guardado con la configuracion `qwen3_5` y pesos en BF16. La model card no especifica numero de capas, dimension oculta, mecanismo de atencion ni ventana de contexto efectiva, por lo que esos extremos quedan como no disponibles. La evaluacion declarada se limita a interacciones de texto y herramientas; no cubre seguridad multimodal.

El entrenamiento descrito tiene tres fases: Attacker SFT, Co-PPO bilateral y Defender SFT guiado por poblacion, sin RL online posterior en el pipeline final. El articulo selecciona el checkpoint Co-PPO d430 por recompensa maxima del defensor durante el entrenamiento; despues, defensores "profesor" ejecutan tareas desde estados iniciales bajo ataques retenidos. De ahi se derivan 5.760 trayectorias seguras y exitosas (4.907 atacadas y 853 replicas no disparadas), con supervision en todos los turnos del asistente. El checkpoint publicado corresponde a la actualizacion 360 tras una epoca de datos, dentro de un trabajo de dos epocas y 720 actualizaciones, heredando el schedule coseno completo y un calentamiento de 22 actualizaciones. No se documenta el volumen total de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO adicionales.

## Capacidades

- Generacion de texto y razonamiento en ingles sobre interacciones multi-turno.
- Ejecucion de tareas con llamadas a herramientas (tool calling) en entornos agénticos, segun el formato de chat y herramientas del checkpoint.
- Resistencia a inyeccion indirecta de prompts: el modelo esta entrenado especificamente para completar la tarea legitima sin obedecer instrucciones maliciosas embebidas en contenido externo.
- Mantenimiento de comportamiento seguro en escenarios de ataque adaptativo, incluyendo ataques optimizados contra la propia politica del defensor.
- Rechazo o neutralizacion de payloads maliciosos en herramientas y en resultados de herramientas (base y mejorados, segun el panel InjecAgent).
- Capacidad de operar como politica defensora en pipelines de RL o de evaluacion adversaria (co-evolucion atacante-defensor).
- Capacidades multimodales: no disponibles; la evaluacion declarada se restringe a texto y herramientas.
- Idiomas distintos del ingles: no disponibles.

## Casos de uso

- Blindaje de agentes con acceso a herramientas: desplegar CoER-Defender como politica que lee resultados de busqueda, correo o APIs externas y decide si una instruccion incrustada en ese contenido debe ejecutarse o ignorarse, aprovechando su entrenamiento contra ataques adaptativos.
- Investigacion en seguridad de agentes: usar el checkpoint como defensor de referencia en bancos de prueba propios (InjecAgent, AgentLAB u otros) para medir tasas de exito de ataque frente a variantes nuevas.
- Generacion de datos de entrenamiento defensivo: emplearlo como profesor que produce trayectorias seguras y exitosas, replicando el procedimiento de Defender SFT descrito en el articulo.
- Evaluacion de robustez en CI de agentes: integrarlo en un arnes que reproduzca tareas representativas con payloads inyectados y bloquee despliegues que degraden la tasa de tarea segura por debajo de un umbral.
- Filtrado o cuarentena de contenido de terceros: preprocesar documentos, tickets o paginas recuperadas por RAG para marcar instrucciones sospechosas antes de que lleguen al agente principal.
- Auditoria de pipelines existentes: comparar el comportamiento de un agente en produccion contra este defensor sobre el mismo conjunto de tareas para estimar la exposicion real a inyeccion indirecta.
- Estudios de co-evolucion adversaria: emplearlo como componente defensor en bucles Co-PPO junto a un atacante entrenado, en entornos aislados y autorizados.

En todos los casos debe tenerse en cuenta que el autor restringe el uso a entornos aislados y autorizados y que el modelo no esta certificado para despliegue.

## Benchmarks y rendimiento

Los siguientes valores estan transcritos del manuscrito actualizado segun la model card; no fueron reproducidos de forma independiente durante el empaquetado. No se han publicado resultados de benchmarks clasicos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

| Evaluacion | Metrica | Resultado |
|---|---|---|
| Panel comun-adaptativo principal | ASR (attack success rate) | 0,25% (3/1.187) |
| Panel comun-adaptativo principal | Utilidad de tarea / Safe-U | 75,40% (895/1.187) en ambas metricas |
| Agregado principal | ASR global | 0,22% sobre 1.355 ejecuciones atacadas |
| Agregado principal | Utilidad / Safe-U | 76,32% sobre 1.512 ejecuciones elegibles en ambas metricas |
| AgentLAB (ataques GPT-5.4) | ASR | 14,12% sobre 949 trayectorias seleccionadas |
| AgentLAB (ataques GPT-5.4) | Exito de tarea | 82,82% |
| AgentLAB (ataques GPT-5.4) | Safe-U | 77,13% (recuentos conjuntos de finalizacion segura) |
| InjecAgent | ASR con payload base | 0/1.043 |
| InjecAgent | ASR con payload mejorado | 20/1.016 (1,97%) |
| Historical-union | ASR | 4,97% sobre cuatro atacantes retenidos, dos intentos cada uno |

Advertencias del propio autor: se trata de una unica ejecucion de entrenamiento, el ASR bajo observado no demuestra robustez universal, significacion estadistica respecto a semilla ni generalizacion estricta fuera de dominio o de payload. El alcance de exclusion del panel InjecAgent queda sin resolver.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16 (aproximadamente 9.000 millones de parametros): en torno a 18 GB solo para pesos, mas cache KV y activaciones; en la practica, unos 20-24 GB para contextos moderados. Es una estimacion de calculo a partir del tamano, no un dato publicado.
- GPU profesionales: A100 (40 GB o 80 GB), H100 (80 GB) y equivalentes permiten BF16 con margen amplio y mayor longitud de contexto.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB podria alojar los pesos en BF16 de forma ajustada, con contexto limitado; no hay confirmacion de que el checkpoint se haya cargado en GPU durante el empaquetado.
- Cuantizacion: no se publican versiones cuantizadas. Para 8 bits habria que prever del orden de 9-11 GB y para 4 bits en torno a 5-7 GB, pero la conversion tendria que realizarla el usuario y no esta validada por el autor.
- Opciones de despliegue: transformers es la via indicada, con una version que soporte la arquitectura Qwen3.5 guardada y el formato de chat y herramientas. vLLM o TGI serian viables solo si su version soporta dicha arquitectura. llama.cpp u Ollama requeririan convertir los pesos a GGUF, conversion que no existe de forma oficial.
- Requisitos de formato: conservar el tokenizer, los tokens especiales, las plantillas y los parametros de generacion suministrados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de alternativas comparables en la informacion proporcionada, y el autor no publica comparaciones directas contra otros defensores. La unica referencia documentada es la familia base.

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CoER-Defender (SFT360) | ~9B (inferido) | no disponible | Defensor SFT contra inyeccion indirecta adaptativa | no disponible (pendiente) | Pesos en safetensors, transferencia en curso |
| Qwen/Qwen3.5-9B | ~9B (familia base) | no disponible | Modelo base generalista con soporte de herramientas | Apache-2.0 | Publico en HuggingFace |
| Otros defensores de inyeccion indirecta | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Artefacto de investigacion: el autor indica explicitamente que el modelo no esta certificado para despliegue y que debe usarse solo en entornos aislados y autorizados.
- Licencia sin resolver: la licencia del artefacto final y los permisos de redistribucion estan pendientes de confirmacion. La licencia Apache-2.0 de la familia base se conserva en `UPSTREAM_LICENSE`, pero no cubre los derechos sobre pesos ajustados, datos de entrenamiento ni salidas del profesor. No debe asumirse uso comercial permitido.
- Estado del repositorio: la transferencia de pesos estaba en curso; el checkpoint solo es utilizable cuando todos los ficheros de pesos y configuracion requeridos estan presentes. Las descargas y los likes registrados eran cero, sin validacion de la comunidad.
- Salidas potencialmente inseguras: el propio autor advierte que las salidas pueden seguir siendo inseguras, incorrectas o susceptibles de inyeccion de prompts.
- Alcance limitado de la evaluacion: solo se evaluan interacciones de texto y herramientas, no seguridad multimodal. Los resultados provienen de un unico entrenamiento y no establecen robustez universal, significacion por semilla ni generalizacion fuera de dominio o de payload.
- Sesgos: no se documenta ninguna evaluacion de sesgos, toxicidad o equidad en la informacion disponible.
- Idioma: solo se declara ingles, sin datos sobre comportamiento en castellano u otras lenguas.
- Riesgo de memorizacion: las comprobaciones de integridad de ficheros no demuestran la ausencia de datos sensibles memorizados en los pesos.
- Procedencia incompleta: la model card indica que el linaje completo de inicializacion y los derechos de redistribucion requieren confirmacion del propietario, y los metadatos de cita que identifican al autor se omitieron durante la revision anonima.
- Verificacion: las comprobaciones realizadas son de integridad offline (metadatos safetensors, tokenizer JSON y completitud del shard index) frente a un manifiesto de descarga verificado; no se afirma haber cargado el modelo en GPU, ejecutado inferencia ni repetido el entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Z-Edgar/CoER-Defender
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Articulo: https://arxiv.org/abs/2609.07529
- Ficha arXiv referenciada en los tags del repositorio: arxiv:2609.07529
- Otros enlaces (paper, blog, repositorio de codigo, demo): no disponibles en la busqueda web realizada
