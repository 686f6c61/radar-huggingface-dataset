# yyyang0/VETime

## Resumen

VETime es un framework de deteccion de anomalias en series temporales en regimen zero-shot que combina representaciones temporales y visuales. Lo desarrolla un equipo academico encabezado por Yingyuan Yang (repositorio bajo el identificador `yyyang0`), y el trabajo ha sido aceptado en NeurIPS 2026. No es un modelo de lenguaje generativo, sino un sistema de deteccion de anomalias compuesto por un codificador temporal, un codificador visual y un modulo de fusion multimodal adaptativo a la tarea.

El problema que aborda es el compromiso clasico en deteccion de anomalias: los metodos centrados en el dominio temporal localizan bien anomalias puntuales pero pierden patrones globales, mientras que los enfoques basados en vision capturan contexto de largo alcance pero pierden resolucion temporal fina. VETime convierte la serie temporal en una imagen trazable (manteniendo la correspondencia temporal), alinea los parches visuales con la linea temporal original y fusiona ambas modalidades de forma adaptativa para localizar tanto anomalias puntuales como anomalias contextuales de largo rango.

La relevancia actual radica en su caracter zero-shot sobre el benchmark TSB-AD (univariante y multivariante) y en su publicacion en NeurIPS 2026. La informacion disponible no especifica el numero de parametros ni la longitud de contexto, ya que no se trata de un transformer generativo con ventana de contexto en el sentido habitual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Framework multimodal: codificador temporal + codificador visual + alineamiento patch-nivel + fusion adaptativa |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende de la longitud de la ventana de la serie temporal de entrada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo no linguistico) |
| Licencia | Apache 2.0 (segun el README del repositorio; el campo de licencia de Hugging Face figura como no disponible) |
| Formato de pesos | checkpoints PyTorch (repositorio separado `yyyang0/VETime-checkpoints`); no se especifica safetensors ni GGUF |

## Arquitectura y entrenamiento

VETime se organiza en cuatro componentes: (1) conversion trazable de serie temporal a imagen, que preserva la correspondencia temporal al rasterizar la senal; (2) alineamiento temporal a nivel de parche, que asocia cada parche visual con su tramo correspondiente en la linea temporal; (3) aprendizaje contrastivo de ventanas de anomalia, que separa ventanas normales de anomalas; y (4) fusion multimodal adaptativa a la tarea, que combina caracteristicas temporales y visuales para la localizacion final. El codigo esta implementado en PyTorch 2.3+ y requiere Python 3.8+ (probado con 3.11) y CUDA 12.1 recomendado.

En cuanto a datos de entrenamiento, el framework se evalua y entrena sobre el benchmark TSB-AD, en sus variantes univariante (TSB-AD-U) y multivariante (TSB-AD-M), distribuidas por TheDatumOrg. La model card no detalla el numero de tokens, la composicion exacta del dataset ni si se empleo RLHF o DPO (no aplica en un modelo de deteccion). La innovacion tecnica destacable es la fusion de dos modalidades (temporal y visual) con alineamiento patch-nivel para resolver el compromiso entre localizacion fina y comprension global, en un regimen de evaluacion zero-shot.

## Capacidades

- Deteccion de anomalias puntuales en series temporales univariantes y multivariantes.
- Deteccion de anomalias contextuales de largo rango gracias a la representacion visual global.
- Evaluacion zero-shot sobre el benchmark TSB-AD sin reentrenamiento especifico por dominio.
- Conversion trazable de series temporales a imagenes con preservacion de la correspondencia temporal.
- Alineamiento patch-nivel entre representacion visual y linea temporal original.
- Fusion multimodal adaptativa a la tarea para localizacion de anomalias.
- Calculo de metricas de evaluacion: VUS-PR, metricas de afiliacion (Affiliation), F1-T (basada en rango con contexto temporal) y Standard-F1 (puntual).
- No soporta tool calling, function calling, agentes ni generacion de texto: no es un modelo linguistico.

## Casos de uso

- Monitorizacion de infraestructura IT: deteccion de picos y caidas anomalas en metricas de servidores (CPU, latencia, throughput) usando la variante multivariante TSB-AD-M, aprovechando la fusion temporal-visual para capturar tanto spikes puntuales como desviaciones sostenidas.
- Deteccion de fraude en transacciones: identificacion de patrones anomalos en series de transacciones con contexto de largo rango, donde la representacion visual permite ver regimenes alterados que un detector puramente puntual pasaria por alto.
- Mantenimiento predictivo industrial: analisis de series de sensores de maquinaria para detectar degradaciones graduales y anomalias contextuales antes de un fallo, con evaluacion zero-shot sobre nuevos equipos sin reentrenamiento.
- Monitorizacion de salud y telemetria biometrica: deteccion de episodios anomalos en series de signos vitales continuos, beneficiandose de la localizacion temporal fina para marcar el inicio y fin del evento.
- Deteccion de anomalias en energia y utilities: identificacion de consumos anomalos o perdidas en series de contadores, con la variante univariante TSB-AD-U para despliegues por medidor.
- Investigacion y benchmarking: uso del framework como baseline reproducible sobre TSB-AD para comparar metodos de deteccion de anomalias con metricas estandarizadas (VUS-PR, Affiliation, F1-T, Standard-F1).
- Analisis de series financieras: deteccion de regimenes anomalos en precios o volumenes, apoyandose en la vision para capturar patrones globales y en el codificador temporal para la localizacion precisa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe las metricas que el codigo reporta (VUS-PR, Affiliation, F1-T, Standard-F1) y el benchmark empleado (TSB-AD-U y TSB-AD-M), pero no incluye cifras numericas de rendimiento ni comparaciones cuantitativas con otros metodos.

## Requisitos de hardware

- VRAM estimada: no disponible; depende del tamano de los codificadores temporal y visual, no especificado en la informacion.
- GPU recomendadas: no disponibles de forma explicita; el entorno probado usa CUDA 12.1, por lo que se requiere una GPU NVIDIA compatible.
- Ajuste en GPU de consumo: no disponible; no se confirma si cabe en RTX 4090 u otras GPU consumer.
- Opciones de despliegue: ejecucion nativa en PyTorch 2.3+ mediante `train.py` y `Test_TSB.py`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplica a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Enfoque | Benchmark | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VETime | Framework multimodal (temporal + vision) | Zero-shot, fusion adaptativa | TSB-AD-U / TSB-AD-M | Apache 2.0 | Codigo + checkpoints en Hugging Face |
| Time-RCD | Modelo fundacional para deteccion zero-shot | Datos sinteticos + Relative Context Discrepancy | No disponible en la informacion | No disponible | Repositorio GitHub (thu-sail-lab) |
| TSB-AD (baselines) | Conjunto de metodos de referencia | Multiples enfoques de deteccion | TSB-AD | No disponible | Codigo en GitHub (TheDatumOrg) |

No se dispone de datos cuantitativos de rendimiento para establecer una comparacion numerica con alternativas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes; cualquier uso conversacional queda fuera de su alcance.
- La informacion publica no detalla el numero de parametros, la composicion del dataset de entrenamiento ni los resultados numericos, lo que dificulta evaluar su rendimiento antes de ejecutarlo.
- El regimen zero-shot puede degradarse en dominios muy alejados de la distribucion de TSB-AD; se recomienda validacion en el dominio objetivo.
- La conversion a imagen introduce una resolucion limitada: anomalias mas finas que la resolucion del rasterizado pueden perderse.
- Riesgo de falsos positivos en series con estacionalidad o ruido no representados en el benchmark de referencia.
- La licencia Apache 2.0 figura en el README del repositorio, pero el campo de licencia de Hugging Face aparece como no disponible; conviene verificar el fichero LICENSE antes de un uso comercial.
- No se documentan sesgos especificos ni limitaciones por idioma (no aplica).

## Enlaces

- Hugging Face (modelo): https://huggingface.co/yyyang0/VETime
- Hugging Face (checkpoints): https://huggingface.co/yyyang0/VETime-checkpoints
- Repositorio GitHub: https://github.com/yyyangcoder/VETime
- Paper arXiv: https://arxiv.org/abs/2602.16681
- Dataset TSB-AD-U: https://www.thedatum.org/datasets/TSB-AD-U.zip
- Dataset TSB-AD-M: https://www.thedatum.org/datasets/TSB-AD-M.zip
- Benchmark TSB-AD: https://github.com/TheDatumOrg/TSB-AD
- Time-RCD (referencia): https://github.com/thu-sail-lab/Time-RCD
