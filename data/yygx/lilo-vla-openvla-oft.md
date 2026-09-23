# yygx/lilo-vla-openvla-oft

## Resumen

LiLo-VLA interaction policy es un checkpoint de vision-language-action (VLA) publicado por el usuario yygx en HuggingFace. Se trata de la política de habilidades atómicas que utiliza el sistema LiLo-VLA (Compositional Long-Horizon Manipulation via Linked Object-Centric Policies), concretamente el módulo de interacción M_int: dado un fotograma de cámara de muñeca, propiocepción relativa al objeto y una instrucción de habilidad, emite un chunk de 8 pasos de acción de 7 grados de libertad.

El modelo parte del backbone OpenVLA-OFT de 7B al que se le añade un adaptador LoRA de rango 32 y una cabeza de acción por regresión L1. El repositorio ocupa 17,1 GB y declara 7.541.237.184 parámetros reales según los pesos safetensors. Se distribuye bajo licencia MIT y se apoya en la librería transformers con código personalizado.

Su relevancia es acotada pero clara para la investigación en robótica: no es un modelo de propósito general ni un LLM conversacional, sino una política especializada que resuelve una subtarea de manipulación desde una pose de aproximación. En el benchmark de 21 configuraciones del proyecto alcanza un 80,0% de Success Rate y un 89,6% de Average Progress en el conjunto LIBERO-Long++, aunque el propio autor advierte que no funciona como política de horizonte largo de forma autónoma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) sobre backbone OpenVLA-OFT 7B con adaptador LoRA de rango 32 y cabeza de acción por regresión L1 (chunks de 8 pasos, 7-DoF) |
| Parametros totales | 7.541.237.184 (aproximadamente 7,54 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio distribuye pesos safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tamano del repositorio | 17,1 GB |
| Modalidad de entrada | imagen de cámara de muñeca (224x224, recorte central) y propiocepción de 8 dimensiones relativa al objeto, más instrucción de habilidad |
| Datos de entrenamiento | 200.000 pasos, batch 16, learning rate 5e-4, con `--image_aug`, sobre el dataset `yygx/lilo-vla-atomic-skills-rlds` |

## Arquitectura y entrenamiento

El checkpoint es el módulo de interacción M_int de LiLo-VLA. La arquitectura combina un backbone VLA preentrenado (OpenVLA-OFT 7B) con un adaptador LoRA de rango 32 y una cabeza de acción que realiza regresión L1 sobre chunks de 8 pasos de acciones de 7 grados de libertad. La observación se limita a una cámara de muñeca (imagen de 224x224 recortada al centro) más propriocepción de 8 dimensiones expresada en coordenadas relativas al objeto, junto con la instrucción textual de la habilidad a ejecutar. No se documenta en la información disponible el número total de tokens de entrenamiento, la composición detallada del dataset ni el uso de RLHF o DPO.

El entrenamiento se realizó durante 200.000 pasos con batch 16, learning rate 5e-4 y aumento de imagen activado. El dataset asociado, `yygx/lilo-vla-atomic-skills-rlds`, sigue el formato RLDS (Reinforcement Learning Datasets). Una innovación operativa destacable es el reparto de responsabilidades: este checkpoint solo ejecuta una habilidad atómica desde una pose de aproximación, mientras que el módulo de alcance, el verificador de habilidades y el bucle de recuperación residen en el repositorio de código. Además, los pesos incluyen `dataset_statistics.json`, que selecciona automáticamente las estadísticas de desnormalización de acciones, de modo que el checkpoint funciona directamente desde un identificador del Hub sin flags adicionales.

## Capacidades

- Ejecución de habilidades atómicas de manipulación: genera chunks de 8 pasos de acciones de 7 grados de libertad a partir de una instrucción de habilidad.
- Comprensión de instrucciones de habilidad en lenguaje natural combinadas con observación visual de muñeca y propiocepción relativa al objeto.
- Control visomotor de precisión sobre un brazo robótico de 7-DoF desde una pose de aproximación predefinida.
- Integración con un planificador externo de horizonte largo: el sistema LiLo-VLA encadena varias invocaciones de este módulo para completar secuencias de habilidades.
- Recuperación de errores mediante el bucle externo del repositorio (verificador de habilidades y módulo de alcance), no de forma autónoma.
- Estandarización de la desnormalización de acciones a través de `dataset_statistics.json` incluido en los pesos.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes multi-paso dentro del propio checkpoint: la composición multi-paso la aporta el sistema que lo orquesta.
- No se documentan capacidades multilingües, de generación de texto libre, de razonamiento simbólico, matemáticas, código, visión general, audio ni modo de pensamiento.
- No se documenta un modo de decodificación especulativa ni mecanismos de atención lineal.

## Casos de uso

- Manipulación robótica de una sola habilidad: el checkpoint recibe una instrucción como "coge la taza" junto con la imagen de muñeca y la propiocepción, y devuelve 8 pasos de acción listos para enviar al controlador del brazo. Es su uso literal y el escenario para el que fue entrenado.
- Organización de cocina de horizonte largo: el planificador de LiLo-VLA descompone tareas como "Complete Kitchen Organization (Original)" en habilidades atómicas y delega cada una en este checkpoint, encadenando módulos de alcance y verificación entre invocaciones.
- Evaluación reproducible en simulación: el script `scripts/evaluate_long_horizon.py` permite lanzar 10 ensayos por configuración en los conjuntos LIBERO-Long++ y Ultra-Long, con el checkpoint cargado directamente desde el Hub. Resulta adecuado como línea base para comparar nuevas políticas de manipulación.
- Reentrenamiento con LoRA para nuevos objetos o habilidades: al ser un adaptador de rango 32 sobre OpenVLA-OFT, se puede ajustar sobre un dataset RLDS propio manteniendo el backbone congelado, con un coste de entrenamiento muy inferior al de un ajuste completo.
- Investigación en políticas centradas en objeto: la entrada de propiocepción relativa al objeto permite estudiar generalización entre posiciones y orientaciones, así como la transferencia de una habilidad a instancias distintas del mismo objeto.
- Desarrollo de bucles de recuperación de errores: el verificador y el bucle de recuperación del repositorio se apoyan en las predicciones de este módulo, lo que lo convierte en un banco de pruebas para estudiar detección de fallos y reintentos en manipulación.
- Prototipado en simulación antes de transferencia a hardware: el checkpoint se ha entrenado y evaluado en el ecosistema LIBERO, por lo que es razonable usarlo para validar una pila de control completa en simulación antes de plantear un despliegue físico.

## Benchmarks y rendimiento

Evaluación realizada con este checkpoint sobre el benchmark de 21 configuraciones de LiLo-VLA, con 10 ensayos por configuración. El Success Rate (SR) mide que la secuencia completa de habilidades se haya completado en orden; el Average Progress (AP) mide la fracción media de la secuencia completada.

| Suite | Configuraciones | Success Rate | Average Progress |
|---|---|---|---|
| LIBERO-Long++ | 12 | 80,0% | 89,6% |
| Ultra-Long | 9 | no disponible en la model card (remite al repositorio) | no disponible en la model card (remite al repositorio) |

La evaluación del benchmark no está sembrada (unseeded), por lo que el Success Rate por tarea varía entre ejecuciones; el autor señala el Average Progress como la métrica estable. No se han publicado en la información disponible resultados de otros benchmarks habituales (MMLU, HumanEval, GSM8K u otros), que además no aplicarían a una política de acción.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (FP16/BF16): en torno a 15,1 GB solo para los pesos (7.541.237.184 parámetros x 2 bytes), más activaciones del codificador visual y de la cabeza de acción; conviene reservar un margen adicional de 2 a 4 GB.
- VRAM estimada en 8 bits: aproximadamente 7,6 GB de pesos. VRAM estimada en 4 bits: aproximadamente 3,8 GB de pesos. El repositorio no distribuye versiones cuantizadas, por lo que habría que generarlas.
- GPU recomendadas: A100 (40 o 80 GB), H100 y L40S para despliegue sin restricciones. En consumer, una RTX 4090 o RTX 3090 de 24 GB debería alojar los pesos en BF16 con margen ajustado; tarjetas de 16 GB requerirían cuantización a 8 o 4 bits.
- Despliegue: la vía documentada es la librería transformers con código personalizado (etiqueta `custom_code`) y los scripts del repositorio LiLo-VLA, instalando el paquete con `pip install -e ".[libero,method]"`. No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje y no a políticas VLA con cabeza de acción.
- Almacenamiento: el repositorio ocupa 17,1 GB, por encima del tamaño teórico de los pesos en BF16, lo que sugiere que incluye artefactos adicionales además de los pesos.
- Latencia y throughput: no disponible. Cabe señalar que, al emitir chunks de 8 pasos de acción por inferencia, la frecuencia efectiva de razonamiento del modelo es aproximadamente una octava parte de la frecuencia de control del robot.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| LiLo-VLA interaction policy (este checkpoint) | 7,54B | no disponible | MIT | HuggingFace, 0 descargas y 0 likes en el momento de la consulta | LIBERO-Long++: 80,0% SR y 89,6% AP |
| OpenVLA-OFT 7B (backbone) | 7B | no disponible | MIT, según la model card de este checkpoint | Repositorio `moojink/openvla-oft` en GitHub | no disponible en la información proporcionada |
| OpenVLA 7B | 7B | no disponible | no disponible en la información proporcionada | no disponible en la información proporcionada | no disponible en la información proporcionada |

No se dispone de datos comparativos adicionales de otros modelos de la misma categoría (por ejemplo, políticas VLA de tamaño similar) en la información proporcionada.

## Limitaciones y advertencias

- No es una política de horizonte largo autónoma. Por sí solo ejecuta una única habilidad atómica desde una pose de aproximación; el módulo de alcance, el verificador de habilidades y el bucle de recuperación viven en el repositorio de código.
- La observación se limita a la cámara de muñeca (224x224 con recorte central). No se documenta uso de cámara cenital, visión estereoscópica ni fusión de múltiples vistas, lo que puede limitar la percepción global de la escena.
- La evaluación del benchmark no está sembrada, de modo que el Success Rate por tarea fluctúa entre ejecuciones. El propio autor recomienda usar el Average Progress como métrica estable.
- Riesgo de alucinación y de fallo en la ejecución: al tratarse de una política aprendida por imitación sobre datos RLDS, pueden producirse acciones fuera de distribución ante objetos, iluminaciones o posiciones no vistas en entrenamiento. No se documentan tasas de fallo por escenario.
- No se documentan los idiomas soportados ni el comportamiento del modelo ante instrucciones en castellano, ya que la información disponible no especifica la composición lingüística del dataset.
- El checkpoint está entrenado y evaluado en el ecosistema LIBERO, de simulación; no se documentan resultados en hardware real, por lo que existe un riesgo de brecha sim-a-real no cuantificado.
- No se documentan sesgos concretos ni datos demográficos, dado que el modelo opera sobre imágenes de escenas y propriocepción, no sobre texto generativo.
- Uso comercial: la licencia MIT lo permite sin restricciones de pago, siempre que se conserve el aviso de copyright. El modelo se construye sobre OpenVLA-OFT, también MIT, cuyos créditos se atribuyen a Moo Jin Kim, Chelsea Finn y Percy Liang.
- Madurez: el repositorio registra 0 descargas y 0 likes, por lo que no existe validación por parte de la comunidad ni informes independientes de reproducibilidad.
- No se documentan métodos de cuantización, por lo que cualquier despliegue en VRAM reducida exige una conversión propia con el riesgo de degradación de la política que ello implica.
- El identificador de arXiv citado en la model card es `2602.21531`, un identificador atípico para el calendario habitual de arXiv; conviene verificar su disponibilidad antes de citarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yygx/lilo-vla-openvla-oft
- Dataset de habilidades atómicas: https://huggingface.co/datasets/yygx/lilo-vla-atomic-skills-rlds
- Repositorio de código de LiLo-VLA: https://github.com/YY-GX/LiLo-VLA
- OpenVLA-OFT (modelo base): https://github.com/moojink/openvla-oft
- Preprint citado: arXiv 2602.21531, "LiLo-VLA: Compositional Long-Horizon Manipulation via Linked Object-Centric Policies" (Yang, Cheng, Fang, Bharadhwaj, Ding, Bertasius, Szafir)
- La búsqueda web realizada no devolvió resultados relevantes para este modelo: las entradas obtenidas correspondían a páginas de Google Earth y Google Maps, sin relación con LiLo-VLA ni con visión-language-action.
