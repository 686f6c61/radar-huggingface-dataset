# Timilehin/barbados-lands-surveys-plot-automation-0.821264226

## Resumen

El modelo `Timilehin/barbados-lands-surveys-plot-automation-0.821264226` es un adaptador LoRA sobre Qwen2.5-VL-7B, desarrollado por Timilehin para el desafío Barbados Lands and Surveys Plot Automation de Zindi. Su propósito es automatizar la extracción de parcelas catastrales a partir de planos topográficos escaneados, generando tanto la geometría del polígono como los metadatos asociados (fecha, área, número de lote) en un único objeto JSON. El pipeline completo incluye un postprocesado con dos cabezas de geometría (polígono y traverse) arbitradas por cierre de error, y reglas heurísticas para campos constantes.

La relevancia actual radica en que aborda un problema real de digitalización de registros de tierras en Barbados, donde los planos se presentan en formato analógico y deben capturarse manualmente. El modelo demuestra que un enfoque de visión-lenguaje con un solo adaptador puede competir con pipelines tradicionales de segmentación y OCR, alcanzando un score de 0.9995 sobre ground truth (frente al 0.5482 de la línea base sin modelo). El repositorio incluye scripts de verificación, generación de vistas, entrenamiento e inferencia, lo que lo hace reproducible.

La arquitectura se basa en Qwen2.5-VL-7B, un modelo multimodal de 7 mil millones de parámetros, con un adaptador LoRA que ajusta el modelo para la tarea específica. No se especifican los parámetros del adaptador ni la longitud de contexto, pero el tamaño del repositorio (2.2 GB) sugiere que se incluyen los pesos del adaptador y posiblemente los scripts. La licencia no está disponible, lo que limita su uso en producción sin verificación legal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-VL-7B con adaptador LoRA |
| Parametros totales | 7 mil millones (modelo base) + adaptador LoRA (tamano no especificado) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (repo en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | No disponible (probablemente ingles, segun los planos de Barbados) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Qwen2.5-VL-7B, un modelo de vision-lenguaje basado en transformer que procesa imagenes y texto. El entrenamiento se describe en el model card como "un LoRA, una generacion por plan", donde el modelo recibe la imagen del plano escaneado y genera un objeto JSON con la geometria y los metadatos. No se proporcionan detalles sobre el dataset de entrenamiento (numero de tokens, composicion, tecnicas de RLHF/DPO), pero el contexto del desafio indica que se usaron ~700 planos de entrenamiento con sus poligonos en formato shapefile.

La innovacion tecnica principal no esta en la arquitectura del modelo sino en el pipeline de postprocesado. El modelo emite dos representaciones de la geometria: un poligono en una cuadricula 0-1000 y un traverse (rumbo y distancia) extraido de las anotaciones impresas en el plano. El traverse es auto-verificable porque los rumbos son multiplos de minuto de arco y las distancias tienen dos decimales, lo que permite detectar errores de lectura mediante el cierre del poligono. El postprocesado usa la regla de Bowditch para distribuir el error de cierre y una escalera de arbitraje que decide que representacion usar segun la calidad de la lectura.

## Capacidades

- Extraccion de geometria de parcelas a partir de planos topograficos escaneados, generando poligonos en coordenadas normalizadas.
- Lectura de metadatos textuales como fecha certificada, area total y numero de lote (LT Num) directamente de la imagen.
- Generacion de traverse (rumbos y distancias) con auto-verificacion de cierre, lo que permite detectar errores de OCR.
- Manejo de geometrias complejas como parcelas en forma de L, mediante el uso de convex hull como fallback.
- Capacidad de procesar planos con multiples parcelas no relacionadas (74 de 662 IDs de entrenamiento tienen geometrias multiples).
- Integracion con un pipeline completo de postprocesado que incluye reglas heuristicas para campos constantes (Parish, Unit of Measurement).
- No se mencionan capacidades de tool calling, agentes, razonamiento multi-paso ni soporte multilingue.

## Casos de uso

- Digitalizacion de registros catastrales: el modelo puede convertir planos analogicos escaneados en datos estructurados (poligonos + metadatos) para su ingreso en sistemas de informacion geografica (SIG). Su capacidad de leer directamente de la imagen elimina la necesidad de segmentacion manual o georreferenciacion.
- Validacion de datos de planos: el traverse auto-verificable permite detectar errores de lectura (por ejemplo, un rumbo mal leido) mediante el error de cierre, lo que es util en flujos de control de calidad donde se necesita confianza en los datos extraidos.
- Automatizacion de procesos de registro de tierras: en oficinas gubernamentales como el Lands and Surveys Department de Barbados, el modelo puede reducir el tiempo de captura manual y minimizar errores de transcripcion.
- Generacion de datasets para entrenamiento de otros modelos: el pipeline puede usarse para crear anotaciones automaticas de parcelas a partir de planos existentes, facilitando la creacion de datos de entrenamiento para tareas de segmentacion o OCR.
- Analisis historico de planos: al extraer geometrias y metadatos de planos antiguos, el modelo permite construir series temporales de cambios en la propiedad de la tierra, util para estudios urbanisticos o historicos.
- Integracion en sistemas de gestion documental: el modelo puede procesar lotes de planos en PDF o imagen, generando salidas JSON que se integran en bases de datos o APIs para consulta posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Sin embargo, el model card reporta metricas internas del pipeline sobre los 662 IDs unicos de entrenamiento:

| Prediccion | Mean IoU | Score total |
|---|---|---|
| Sin modelo, cuadrado unitario | 0.575 | 0.5215 |
| Sin modelo, forma media de entrenamiento | 0.628 | 0.5482 (suelo) |
| Minimo rectangulo rotado de la verdad | 0.905 | — |
| Convex hull de la verdad | 0.981 | — |
| Verdad + jitter de 2% en vertices | 0.939 | — |
| Verdad + jitter de 5% en vertices | 0.862 | — |
| Pipeline con ground truth | 0.999 | 0.9995 (techo) |

El score se calcula como `0.5·IoU + 0.3·MCA + 0.2·(1 − WER/2)`, donde MCA es la precision de clasificacion de metadatos y WER es la tasa de error de palabras. El pipeline alcanza un techo de 0.9995 cuando se alimenta con ground truth, lo que indica que el postprocesado es casi perfecto. No hay comparacion con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: Qwen2.5-VL-7B en FP16 requiere aproximadamente 14-16 GB de VRAM para inferencia. Con cuantizacion (por ejemplo, 4-bit) podria reducirse a ~6-8 GB, pero no se especifican cuantizaciones en el repositorio.
- GPU recomendadas: tarjetas con 16 GB o mas, como RTX 4090, A100 (40 GB) o H100. Para inferencia en consumer GPU, una RTX 4080 o 4090 seria adecuada. No se proporcionan datos de latencia o throughput.
- Opciones de despliegue: el pipeline esta disenado para ejecutarse en Colab/Kaggle (se menciona un notebook de entrenamiento). Para inferencia, se puede usar vLLM, TGI o llama.cpp si se convierte el modelo a GGUF, pero no hay instrucciones oficiales.
- El repositorio incluye scripts de verificacion que no requieren GPU, lo que permite validar el entorno antes de la inferencia.

## Comparativa con modelos similares

No disponible. No se encontraron comparaciones directas con otros modelos de vision-lenguaje en la informacion proporcionada. El modelo esta especializado en una tarea muy concreta (planos topograficos de Barbados) y no se han publicado comparaciones con alternativas como Llama 3.2 Vision o Phi-3 Vision en este dominio.

## Limitaciones y advertencias

- Sesgo de dominio: el modelo esta entrenado especificamente con planos de Barbados, que tienen un formato particular (orientacion grid-north, unidades en metros cuadrados, parroquias fijas). Puede no generalizar a planos de otros paises o con convenciones diferentes.
- Dependencia de heuristicas: el pipeline depende de reglas externas (por ejemplo, forzar Parish como "St. Philip" y Unit of Measurement como "sq m") que son validas solo para el dataset de entrenamiento. En produccion, estas reglas deben adaptarse al contexto.
- Riesgo de alucinacion en lectura de numeros: el modelo puede generar valores incorrectos en fechas, areas o numeros de lote, especialmente en planos con baja calidad de escaneo o anotaciones ilegibles.
- Problema de IDs duplicados: 74 de 662 IDs de entrenamiento contienen multiples geometrias no relacionadas, lo que puede confundir al modelo si no se maneja adecuadamente en el postprocesado.
- Licencia desconocida: al no especificarse la licencia, el uso comercial del modelo o sus derivados no esta garantizado. Se recomienda contactar al autor antes de utilizarlo en produccion.
- Sin soporte para otros idiomas: el modelo esta disenado para planos en ingles (el idioma de los documentos de Barbados). No se ha probado con otros idiomas.
- El pipeline no esta pensado para georreferenciacion: la metrica de evaluacion ignora posicion, escala y aspecto, por lo que el modelo no produce coordenadas geograficas reales. Para aplicaciones que requieran georreferenciacion, se necesita un paso adicional.

## Enlaces

- HuggingFace: https://huggingface.co/Timilehin/barbados-lands-surveys-plot-automation-0.821264226
- GitHub (solucion de referencia): https://github.com/papapizzachess/Barbados/blob/main/README.md
- GitHub (desafio completo): https://github.com/josephgitau/Barbados-Lands-and-Surveys-Plot-Automation-Challenge
- CompeteHub (descripcion del desafio): https://www.competehub.dev/en/competitions/zindibarbados-lands-and-surveys-plot-automation-challenge
- Zindi (pagina del desafio): https://zindi.world/competitions/barbados-lands-and-surveys-plot-automation-challenge
- Zindi (datos): https://zindi.world/competitions/barbados-lands-and-surveys-plot-automation-challenge/data
