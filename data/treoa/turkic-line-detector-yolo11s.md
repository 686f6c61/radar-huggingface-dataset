# treoa/turkic-line-detector-yolo11s

## Resumen

`turkic-line-detector-yolo11s` es un detector de lineas de texto (text-line detection) orientado a OCR sobre imagenes de documentos, desarrollado por el usuario treoa (autoria declarada: Anuar Suleimenov, Zhalgasbek Bolatov, Aidana Baglanova, Anel Kadirbekova y A. T. Nguyen, Nazarbayev University). Se trata de un modelo YOLO11s de Ultralytics reentrenado como etapa 2 del pipeline de un proyecto de reconocimiento de escritura manuscrita para lenguas turquicas escritas en alfabeto latino y cirilico (kazajo, kirguis, uzbeko, turco, azeri, tatar, bashkir, turcomano y yakuto).

El modelo no transcribe texto: su tarea es localizar y devolver las cajas delimitadoras de cada linea de texto en una imagen de pagina. El paquete de la release incluye un script `infer.py` que procesa una imagen, una carpeta o un manifiesto TSV y emite un TSV con identificador, numero de lineas, cajas y puntuaciones; el recorte y la lectura posterior de cada caja corresponde al "line reader" del pipeline de pagina del proyecto.

Es relevante por dos motivos: cubre un nicho poco atendido (deteccion de lineas manuscritas en lenguas turquicas con mezcla de escrituras latina y cirilica) y publica una version concreta de pesos (retrain D5) que excluye las paginas generadas con una fuente de uso personal, sustituyendo al detector anterior `yolo_s2` empleado en todos los resultados a nivel de pagina reportados por el proyecto antes del 26 de noviembre de 2026. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamano declarado del repo es 0.0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11s (Ultralytics), deteccion de objetos; etapa 2 (stage-2) de un pipeline OCR |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos `best.pt` en formato PyTorch/Ultralytics) |
| Idiomas soportados | kk, ky, uz, tr, az, tt, ba, tk, sah (escritura latina y cirilica) |
| Licencia | AGPL-3.0 (codigo y pesos) |
| Formato de pesos | `best.pt` (PyTorch, Ultralytics); sha256 95e795874dc01691aee0a9eaf69d5f6661b9908833c80ffa622577206ed6547b, 19 304 858 bytes |

## Arquitectura y entrenamiento

El modelo es un detector YOLO11s, es decir, una red convolucional de una sola etapa para deteccion de objetos, ajustada para la tarea especifica de localizar lineas de texto en imagenes de pagina. La model card identifica los pesos como `yolo_s2_d5` (ruta original `DATA/checkpoints/r5/linedet/detectors/yolo_s2_d5/weights/best.pt`, job 55706), con las rutas de metadatos relativizadas en el job 55950. Se trata de un reentrenamiento de la etapa 2 que excluye las paginas generadas con una fuente de uso personal (decision del propietario D5); el detector anterior, `yolo_s2`, se entreno con 83 paginas generadas adicionales dibujadas con esa fuente.

La model card indica que la informacion completa de entrenamiento (datos, metricas, ajustes de decodificacion y notas de licencia) esta en el fichero `model_card.json` del repositorio, y que la comparacion entre ambos detectores sobre las mismas paginas de validacion se encuentra en `metrics.comparison_with_earlier_detector`. El numero de tokens de entrenamiento, la composicion exacta del dataset y el uso de tecnicas como RLHF o DPO no aplican a un detector de vision y no se detallan en la informacion disponible. No se documentan innovaciones arquitectonicas propias mas alla del ajuste de YOLO11s a la tarea.

## Capacidades

- Deteccion de lineas de texto en imagenes de documentos, incluyendo escritura manuscrita.
- Salida de cajas delimitadoras con puntuaciones de confianza por linea.
- Procesamiento por lotes: una imagen, una carpeta de imagenes o un manifiesto TSV, con salida en TSV (id, n_lines, boxes, scores).
- Ejecucion en CPU y en GPU.
- Cobertura de lenguas turquicas en escritura latina y cirilica (kk, ky, uz, tr, az, tt, ba, tk, sah) a nivel de deteccion de lineas.
- No realiza reconocimiento de texto (transcripcion): esa funcion corresponde al line reader del pipeline.
- No se documenta soporte de tool calling, function calling, agentes ni modos de razonamiento (no aplica a este tipo de modelo).

## Casos de uso

- Digitalizacion de archivos manuscritos en lenguas turquicas: el detector localiza las lineas de cada pagina escaneada y entrega las cajas al line reader del pipeline para su transcripcion, lo que permite procesar fondos documentales en kazajo, kirguis, uzbeko, turco, azeri, tatar, bashkir, turcomano o yakuto con un unico detector.
- Preprocesado OCR en produccion: integrado como primera etapa antes de un motor de reconocimiento, segmenta paginas completas en lineas y reduce el ruido que introduciria pasar la pagina entera al lector.
- Procesamiento por lotes de corpus documentales: el script `infer.py` acepta una carpeta o un manifiesto TSV y devuelve un TSV con cajas y puntuaciones, lo que facilita la ejecucion desatendida sobre colecciones grandes y la trazabilidad por identificador.
- Analisis de layout en investigacion linguistica: las cajas y el recuento de lineas por pagina permiten estudiar estructura de documentos, densidad de texto y variabilidad de escritura entre lenguas y alfabetos.
- Segmentacion previa en pipelines de reconocimiento de escritura manuscrita (HTR): al aislar lineas, mejora la precision de modelos de transcripcion que trabajan a nivel de linea y no de pagina.
- Filtrado y control de calidad de digitalizaciones: las puntuaciones de confianza por caja permiten descartar o revisar manualmente paginas con detecciones de baja calidad antes de enviarlas a un lector costoso.
- Despliegue en entornos sin GPU: al ejecutarse tambien en CPU, sirve para digitalizacion de bajo volumen en estaciones de trabajo o servidores sin acelerador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a `metrics.comparison_with_earlier_detector` (comparacion con el detector anterior `yolo_s2` sobre las mismas paginas de validacion) y a las cifras de CER a nivel de pagina del proyecto, pero los valores numericos no se incluyen en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; por el tamano de los pesos (19,3 MB para `best.pt`), la huella es reducida y compatible con GPUs de gama baja, aunque no se publica una cifra oficial.
- GPU recomendadas: no se especifican modelos concretos (A100, H100, RTX 4090 u otros) en la informacion disponible.
- Compatibilidad con GPU de consumo: el modelo declara ejecucion en CPU y GPU; por el tamano de los pesos es previsible que quepa en GPUs de consumo, pero no se confirma con datos publicados.
- Opciones de despliegue: el paquete incluye `infer.py` y `requirements.txt` con las versiones exactas de paquetes del entorno `CODE/.venv_kraken`; la libreria declarada es Ultralytics. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican a un detector de vision).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| turkic-line-detector-yolo11s | YOLO11s, deteccion de lineas | no disponible | no aplica | AGPL-3.0 | Hugging Face (treoa) |
| yolo_s2 (detector anterior del mismo proyecto) | YOLO11s, deteccion de lineas | no disponible | no aplica | no disponible | Uso interno del proyecto; comparado en `metrics.comparison_with_earlier_detector` |
| Kraken (segmentacion de lineas) | Segmentacion de lineas para HTR | no disponible | no aplica | no disponible | Codigo abierto; referenciado indirectamente por el nombre del entorno `.venv_kraken` |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada; la unica comparacion documentada es la del detector D5 frente a `yolo_s2` sobre las mismas paginas de validacion, cuyos valores no se incluyen.

## Limitaciones y advertencias

- El modelo solo detecta lineas de texto; no transcribe. Requiere un line reader externo para obtener texto.
- Los pesos corresponden al reentrenamiento D5, que excluye las paginas generadas con una fuente de uso personal. Los resultados de pagina publicados por el proyecto antes del 26 de noviembre de 2026 (ejecuciones `e2e_yolo_s2_*`, cifras de CER de pagina y resultados del paper) se obtuvieron con el detector anterior `yolo_s2`, no con estos pesos; no deben atribuirse a esta release sin verificar la comparacion.
- Cobertura linguistica limitada a las nueve lenguas turquicas declaradas; el comportamiento fuera de ese conjunto no esta documentado.
- Licencia AGPL-3.0 para codigo y pesos: impone obligaciones de copyleft y de publicacion del codigo fuente a quien ofrezca el modelo como servicio en red; conviene revisar `LICENSE` y `NOTICE` antes de un uso comercial. El codigo de Ultralytics conserva su propia copyright.
- Riesgo de falsos positivos y negativos en paginas con layouts atipicos, ruido de escaneo o escritura muy variable: no se documentan metricas de error en la informacion disponible.
- Sesgos: no se documentan sesgos conocidos; el entrenamiento esta sesgado hacia las lenguas y los estilos de escritura del corpus del proyecto.
- Sin descargas ni likes en el momento de la consulta y con el repositorio marcado como 0.0 GB: no hay evidencia de uso en produccion por terceros.
- La model card completa esta en `model_card.json`; los detalles de entrenamiento, metricas y ajustes de decodificacion deben consultarse alli antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/treoa/turkic-line-detector-yolo11s
- Fichero `model_card.json` (card completa): https://huggingface.co/treoa/turkic-line-detector-yolo11s/blob/main/model_card.json
- Pesos `best.pt`: https://huggingface.co/treoa/turkic-line-detector-yolo11s/blob/main/best.pt
- Script de inferencia `infer.py`: https://huggingface.co/treoa/turkic-line-detector-yolo11s/blob/main/infer.py
- Licencia AGPL-3.0: https://huggingface.co/treoa/turkic-line-detector-yolo11s/blob/main/LICENSE
- Aviso legal y datos de entrenamiento `NOTICE`: https://huggingface.co/treoa/turkic-line-detector-yolo11s/blob/main/NOTICE
- Ultralytics (framework): https://github.com/ultralytics/ultralytics
- Referencia bibliografica: Suleimenov, A., Bolatov, Z., Baglanova, A., Kadirbekova, A., Nguyen, A. T. (2026). A Handwriting Recognition Model for Turkic Languages in Latin and Cyrillic Script. Project report, Nazarbayev University (sin URL disponible).
