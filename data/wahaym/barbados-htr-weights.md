# wahaym/barbados-htr-weights

## Resumen

`wahaym/barbados-htr-weights` no es un modelo independiente, sino el repositorio de pesos del paquete de revisión de código de la solución de `wahaym` al reto *R.O.A.D. Barbados Historic Handwriting Challenge* de Zindi. El problema que aborda es el reconocimiento de texto manuscrito (HTR) a nivel de línea sobre registros de escrituras (*deed*) y protestas de Barbados de los siglos XVII y XVIII, un dominio con grafías irregulares, tinta degradada y vocabulario notarial arcaico.

El repositorio ocupa 21,6 GB y contiene 66 carpetas bajo `checkpoints/<modelo>/`: adaptadores LoRA (`adapter_model.safetensors` más `adapter_config.json` y ficheros de tokenizer/processor) o, en el caso de los fine-tunes completos, un `last.pt` con `params` y `buffers`. Se incluye además `checkpoints/PROVENANCE.json`, que documenta la ejecución de entrenamiento y la época de la que se exportó cada carpeta.

El paquete incorpora también tres bases preentrenadas públicas sin modificar: `party` (Zenodo 20642057, Apache-2.0), PP-OCRv6 medium (Zenodo 21788410, Apache-2.0) y SATRN (`Riksarkivet/satrn_htr`, MIT). Los pesos se descargan mediante `scripts/download_weights.py` (invocado por `install.sh`) dentro de la carpeta `models/` del paquete, y el autor indica explícitamente que no están pensados para usarse por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (conjunto de modelos base de tipo OCR/VLM fine-tuneados; no se detalla la arquitectura de cada checkpoint) |
| Parametros totales | no disponible (varia por checkpoint; las bases declaradas abarcan desde ~1B hasta 32B) |
| Parametros activos | no disponible (no se declara que ningun checkpoint sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican pesos cuantizados; adaptadores en safetensors y fine-tunes completos en `.pt`) |
| Idiomas soportados | no disponible (el corpus de entrenamiento son registros manuscritos de Barbados de los siglos XVII-XVIII) |
| Licencia | other, `license_name: per-base-model` (se aplican las licencias de cada modelo base) |
| Formato de pesos | safetensors (adaptadores LoRA) y `.pt` (fine-tunes completos); pesos de bases publicas sin modificar |
| Tamano del repositorio | 21,6 GB |
| Numero de checkpoints | 66 carpetas en `checkpoints/` |
| Tarea | reconocimiento de texto manuscrito a nivel de linea (HTR/OCR) |
| Dominio | registros notariales y de protestas de Barbados, siglos XVII-XVIII |
| Autor | wahaym |
| Fecha de creacion | 2026-10-07 |
| Ultima actualizacion | 2026-10-07 |

## Arquitectura y entrenamiento

La solucion es un *ensemble* de modelos fine-tuneados sobre datos de la competicion exclusivamente. Cada miembro del ensemble parte de un modelo base publico y se exporta de dos formas: como adaptador LoRA (safetensors con su configuracion y ficheros de tokenizer/processor) o como fine-tune completo serializado en `last.pt` con los tensores de parametros y buffers. El fichero `checkpoints/PROVENANCE.json` registra la ejecucion de entrenamiento y la epoca concreta de la que procede cada carpeta, lo que permite reproducir la composicion del ensemble.

Las bases declaradas sobre las que se apoyan los pesos fine-tuneados son: `zai-org/GLM-OCR` (MIT); `Qwen/Qwen3-VL-4B`, `Qwen/Qwen3-VL-8B` y `Qwen/Qwen3-VL-32B-Instruct`, `PaddlePaddle/PaddleOCR-VL-1.6`, `ATH-MaaS/OvisOCR2`, `lightonai/LightOnOCR-2-1B-base`, `google/gemma-4-E4B-it`, `Kansallisarkisto/multicentury-htr-model` y `wjbmattingly/nara-qwen-3.5-2b` (Apache-2.0), mas `ENC-PSL/Medusa0.1Line-4B` (CC-BY-4.0). No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otra optimizacion por preferencias. Tampoco se documentan innovaciones de inferencia como decodificacion especulativa o atencion lineal.

## Capacidades

- Reconocimiento de texto manuscrito a nivel de linea sobre documentos historicos digitalizados.
- Transcripcion de registros notariales y de protestas de Barbados de los siglos XVII y XVIII, con grafias y abreviaturas de la epoca.
- Inferencia en modo ensemble: combinacion de 66 checkpoints (adaptadores LoRA y fine-tunes completos) para agregar predicciones.
- Integracion con las bases publicas `party`, PP-OCRv6 medium y SATRN mediante pesos de partida incluidos en el repositorio.
- Trazabilidad de cada checkpoint a su ejecucion de entrenamiento y epoca mediante `PROVENANCE.json`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo *thinking*, vision general, audio): no disponible; el unico uso documentado es HTR/OCR de linea.
- Uso autonomo: no soportado; el autor indica que los pesos se consumen desde `scripts/download_weights.py` del paquete de codigo.

## Casos de uso

- Digitalizacion masiva de archivos coloniales: el ensemble se aplica linea a linea sobre imagenes de registros de escrituras y protestas, generando transcripciones en texto plano listas para catalogacion.
- Reproduccion del baseline de la competicion Zindi: al incluir `PROVENANCE.json` y los 66 checkpoints, permite reconstruir y auditar la solucion presentada al reto *R.O.A.D. Barbados Historic Handwriting Challenge*.
- Busqueda a texto completo en fondos historicos: una vez transcritas las lineas, el texto resultante alimenta indices de busqueda que hoy no existen para estos registros manuscritos.
- Genealogia y reconstruccion de linajes: la transcripcion de escrituras permite extraer nombres, fechas y propiedades de registros de Barbados de los siglos XVII-XVIII, un material de interes para genealogistas e historiadores.
- Extraccion de entidades para investigacion historica cuantitativa: sobre el texto transcrito se pueden ejecutar posteriores pipelines de NER para estudiar transmisiones de propiedad, censos o conflictos notariales a escala de decadas.
- Investigacion en HTR historico: los adaptadores LoRA publicados sirven como punto de partida para experimentos de *fine-tuning* sobre otros corpora manuscritos de la misma epoca.
- Comparacion de bases OCR/VLM: al incluir los pesos de `party`, PP-OCRv6 medium y SATRN, permite reproducir experimentos controlados sobre la misma tarea.
- Integracion en un sistema documental interno: el paquete de codigo descarga los pesos en `models/` y expone la inferencia, de modo que puede envolverse en un servicio de transcripcion bajo demanda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de tasa de error de caracteres (CER), tasa de error de palabra (WER) ni puntuaciones en tareas estandar (MMLU, HumanEval, GSM8K u otras), y tampoco se detalla la puntuacion obtenida en la competicion Zindi.

## Requisitos de hardware

- El repositorio completo ocupa 21,6 GB en disco; cargar varios checkpoints del ensemble en memoria multiplica ese requisito.
- VRAM de inferencia: no disponible de forma exacta, ya que depende del modelo base de cada checkpoint (las bases declaradas van de ~1B a 32B parametros).
- Para los checkpoints derivados de modelos de 32B (por ejemplo `Qwen/Qwen3-VL-32B-Instruct`) se requiere hardware de clase centro de datos; no se especifica el tipo de precision ni el consumo concreto.
- GPU recomendadas: no disponible en la informacion proporcionada. Como referencia orientativa por tamano de base, los modelos de 32B exigen GPUs de 80 GB; los de 7B-8B pueden ejecutarse en GPUs de 24 GB; los de ~1B-4B caben en GPUs de consumo con precision reducida.
- Uso en GPU de consumo: no disponible para el ensemble completo; solo seria viable para los checkpoints de menor tamano.
- Opciones de despliegue: los adaptadores LoRA requieren `transformers` y `peft` sobre su base; los fine-tunes completos se cargan con PyTorch a partir de `last.pt`. No se documentan formatos GGUF, ni soporte para vLLM, Ollama, llama.cpp o TGI.
- Latencia y throughput: no disponibles.
- Nota de contexto: el repositorio relacionado `guelmbaye/barbados-htr` documenta un cuaderno de Colab pensado para ejecutarse en una GPU T4; se trata de otro proyecto sobre el mismo reto y no de una especificacion de este repositorio de pesos.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `wahaym/barbados-htr-weights` | Ensemble HTR (66 checkpoints, LoRA y fine-tunes completos) | no disponible | no disponible | other, `per-base-model` | HuggingFace, 21,6 GB |
| `vanijonny/barbados_htr_model` | HTR para el mismo reto | no disponible | no disponible | no disponible | HuggingFace |
| `Kansallisarkisto/multicentury-htr-model` | Base HTR historico | no disponible | no disponible | Apache-2.0 | HuggingFace |
| `Riksarkivet/satrn_htr` | Base HTR (SATRN) | no disponible | no disponible | MIT | HuggingFace |

No se dispone de datos de rendimiento comparado entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- Los pesos no estan pensados para uso autonomo: el autor indica que se descargan desde `scripts/download_weights.py` del paquete de codigo y se consumen dentro de el.
- Licencia `other` con `license_name: per-base-model`: la licencia aplicable depende del modelo base de cada checkpoint, por lo que un uso comercial exige revisar caso por caso las licencias de GLM-OCR, Qwen3-VL, PaddleOCR-VL, OvisOCR2, LightOnOCR, Gemma, multicentury-htr, nara-qwen y Medusa. Esta mezcla de licencias (MIT, Apache-2.0, CC-BY-4.0) complica la redistribucion y el despliegue comercial.
- No hay resultados de benchmarks publicados, por lo que no es posible estimar la calidad de transcripcion antes de evaluarla en el propio corpus.
- Dominio muy restringido: los pesos se entrenaron unicamente con datos de la competicion (registros de Barbados de los siglos XVII-XVIII); el rendimiento fuera de ese dominio, tipo de letra o periodo es desconocido.
- Riesgo de alucinacion: los modelos base son en su mayoria VLM generativos, que pueden producir texto plausible en lugar de transcribir fielmente trazos ilegibles; en documentos historicos esto se traduce en nombres, fechas o cifras inventados. No se documentan mecanismos de mitigacion.
- Sesgos conocidos: no disponibles.
- Limitaciones de idioma: no se declaran idiomas soportados; el material de entrenamiento es de lengua inglesa del periodo colonial, y no hay informacion sobre su comportamiento en castellano u otras lenguas.
- Sin datos sobre el tipo de cuantizacion ni sobre el consumo real de VRAM, lo que dificulta planificar el despliegue.
- La trazabilidad depende de `PROVENANCE.json`; si ese fichero no se conserva junto a los checkpoints, se pierde la correspondencia entre carpeta, ejecucion y epoca.
- El repositorio no registra descargas ni *likes* en el momento de la consulta, lo que reduce las senales de validacion por parte de la comunidad.

## Enlaces

- Repositorio de pesos: https://huggingface.co/wahaym/barbados-htr-weights
- Proyecto relacionado sobre el mismo reto (otro autor): https://huggingface.co/vanijonny/barbados_htr_model
- Ficheros del proyecto relacionado: https://huggingface.co/vanijonny/barbados_htr_model/tree/main
- Ficha indexada del proyecto relacionado: https://essamamdani.com/ai-models/hf-vanijonny-barbados-htr-models
- Repositorio de codigo relacionado sobre el reto: https://github.com/guelmbaye/barbados-htr
- README del repositorio relacionado: https://github.com/guelmbaye/barbados-htr/blob/main/README.md
- Base publica incluida: `party` (Zenodo 20642057, Apache-2.0)
- Base publica incluida: PP-OCRv6 medium (Zenodo 21788410, Apache-2.0)
- Base publica incluida: https://huggingface.co/Riksarkivet/satrn_htr (MIT)
- Bases declaradas por el autor: https://huggingface.co/zai-org/GLM-OCR, https://huggingface.co/Qwen/Qwen3-VL-32B-Instruct, https://huggingface.co/PaddlePaddle/PaddleOCR-VL-1.6, https://huggingface.co/ATH-MaaS/OvisOCR2, https://huggingface.co/lightonai/LightOnOCR-2-1B-base, https://huggingface.co/google/gemma-4-E4B-it, https://huggingface.co/Kansallisarkisto/multicentury-htr-model, https://huggingface.co/wjbmattingly/nara-qwen-3.5-2b, https://huggingface.co/ENC-PSL/Medusa0.1Line-4B
