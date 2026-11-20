# zapell/gloop-dnabert2

## Resumen

gloop-dnabert2 es un clasificador de secuencias de ADN obtenido por ajuste fino (fine-tuning) completo de DNABERT-2-117M, un transformer basado en BERT adaptado a genómica mediante tokenización por pares de nucleótidos. El modelo asigna a una ventana de 500 pb de ADN humano una probabilidad de ser un "G-loop candidato", es decir, una región donde se detectan simultáneamente una estructura G-quadruplex (G4) y un R-loop. Lo desarrolla un grupo de estudiantes del curso BIOINF 535 de la Universidad de Michigan (Zach Apell, Tony Bowei Wang y Oscar Reyes Parker).

El problema que aborda es concreto: la detección experimental de G4 y R-loops requiere técnicas distintas (ChIP con BG4 y R-ChIP), y la coincidencia espacial de ambas señales en el genoma es costosa de verificar. Este modelo ofrece un prior computacional rápido para priorizar regiones candidatas antes de validación experimental.

Es relevante como ejemplo de aplicación de modelos de lenguaje genómicos a tareas de clasificación binaria con partición por cromosoma, evitando fuga de información entre entrenamiento y test. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su licencia no está especificada, lo que limita su uso en producción sin aclaración previa del autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT (DNABERT-2), ajustado para clasificación de secuencias |
| Parámetros totales | 117M (heredados de DNABERT-2-117M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens (pares de nucleótidos); ventana de entrada de 500 pb con truncación |
| Tipos de cuantización | no disponible (pesos en fp32/fp16 según checkpoint; no se documentan GGUF ni otras) |
| Idiomas soportados | no aplica (secuencias de ADN; alfabeto A/C/G/T) |
| Licencia | no disponible |
| Formato de pesos | safetensors/PyTorch (repo de 0,5 GB con `trust_remote_code=True`) |

## Arquitectura y entrenamiento

La base es DNABERT-2-117M, un transformer encoder con atención multi-cabeza estándar y tokenización por k-mers (pares de nucleótidos) en lugar de vocabulario de palabras. Sobre esta base se realizó un fine-tuning completo con el script `finetune/train.py` del propio DNABERT-2: learning rate 3e-5, batch 32, 5 épocas, precisión fp16 y longitud máxima de 128 tokens. El checkpoint guardado es el de menor pérdida en dev (paso 400 de 840).

Los datos de entrenamiento son ventanas de 500 pb de hg38 en células K562, cromosomas 1-22, con la blacklist de ENCODE eliminada. La etiqueta positiva (G4 + R-loop) agrupa 2.300 ventanas que solapan tanto un core de R-loop replicado (R-ChIP D210N, R-loopBase) como un core de G4 (picos BG4 ChIP, GSE181373). Los negativos son 2.300 ventanas solo-G4 emparejadas por contenido GC, 271 solo-R-loop y 2.300 sin ninguna de las dos estructuras, también emparejadas por GC. La partición es por cromosoma: test chr1 + chr8, dev chr2 + chr9, entrenamiento el resto, lo que evita fuga de información entre ventanas solapadas.

## Capacidades

- Clasificación binaria de ventanas de ADN de 500 pb en "G-loop candidato" (probabilidad) frente a "no G-loop".
- Detección implícita de señales de G-quadruplex y de R-loop, ya que el modelo se entrenó con negativos específicos para cada estructura.
- Salida de logits y probabilidad calibrada vía softmax sobre dos clases.
- Inferencia sobre secuencias de ADN con alfabeto restringido a A/C/G/T.
- Integración en pipelines de bioinformática mediante `transformers` con `trust_remote_code=True`.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: es un clasificador de secuencia, no un modelo generativo.

## Casos de uso

- Priorización de regiones para validación experimental: dado un conjunto de ventanas de 500 pb de hg38, el modelo puntúa cada una y permite ordenar candidatos antes de realizar ChIP de BG4 o R-ChIP, reduciendo el número de ensayos necesarios.
- Análisis de promotores: como el 89% de las ventanas G-loop del conjunto de entrenamiento están a menos de 1 kb de un TSS, el modelo es adecuado para cribar regiones promotoras en busca de estructuras coincidentes de G4 y R-loop.
- Estudio de una línea celular concreta (K562): útil en proyectos que trabajen con esa línea y quieran un prior computacional alineado con sus datos epigenómicos.
- Filtrado de falsos positivos en llamadas de G4: al incluir negativos solo-G4 emparejados por GC, el modelo ayuda a distinguir G4 aislados de regiones donde además hay R-loop.
- Docencia y reproducibilidad: el repositorio incluye el código de DNABERT-2 y una app web local que acepta ADN pegado y devuelve una puntuación por ventana de 500 pb, útil para demostraciones.
- Generación de hipótesis genómicas a escala: escaneo de ventanas a lo largo de cromosomas para generar listas de candidatos que alimenten análisis posteriores, con la advertencia de que la precisión genome-wide será menor que la del test balanceado.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de test (chr1 + chr8, 1.079 ventanas, 40% positivas):

| Modelo | AUROC | AUPRC | MCC |
|---|---|---|---|
| gloop-dnabert2 | 0,865 | 0,782 | 0,494 |
| Regresión logística k-mer (k ≤ 4) + GC | 0,814 | 0,701 | 0,375 |

AUROC del modelo frente a cada clase negativa por separado: solo-G4 0,789; solo-R-loop 0,772; ninguna 0,950. Dentro de promotores, el AUROC baja a 0,781.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5-1 GB en fp32 para 117M parámetros; menos de 1 GB en fp16. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se especifican; cualquier GPU con al menos 2 GB de VRAM es suficiente (GTX 1650, RTX 3060, RTX 4090, A100, H100).
- Cabe en GPU consumer: sí, en todas las gamas actuales, incluidas integradas con suficiente memoria compartida.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es el método documentado. No se documentan vLLM, llama.cpp, Ollama ni TGI; al ser un clasificador BERT, la integración con esos servidores no está soportada de forma nativa.
- Restricciones de entorno: requiere `torch==1.13.1` y `transformers==4.29.2`, sin Triton instalado, según la model card.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gloop-dnabert2 | 117M | 128 tokens (500 pb) | Clasificación G-loop | no disponible | Hugging Face (0 descargas) |
| DNABERT-2-117M (base) | 117M | 512 tokens | Representaciones genómicas generales | no disponible en la información | Hugging Face |
| Regresión logística k-mer + GC | no aplica | ventana de 500 pb | Clasificación G-loop | no aplica | Baseline del propio proyecto |

No se dispone de otros clasificadores específicos de G-loop publicados en la información proporcionada para una comparación más amplia.

## Limitaciones y advertencias

- Las etiquetas positivas son solapamientos de picos de experimentos separados; no prueban que ambas estructuras se formen en la misma molécula al mismo tiempo.
- Entrenado únicamente en K562; otros tipos celulares no han sido evaluados.
- El conjunto de test está balanceado y emparejado por GC; los G-loops reales son raros en el genoma, por lo que un escaneo genome-wide tendrá una precisión mucho menor que la reportada.
- Sesgo hacia promotores: el 89% de las ventanas positivas están a menos de 1 kb de un TSS, y dentro de promotores el AUROC cae a 0,781.
- Solo acepta ventanas de 500 pb; otras longitudes quedan fuera de la distribución de entrenamiento.
- Licencia no especificada: no se puede asumir uso comercial sin consultar al autor.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de falsos positivos con confianza alta en regiones fuera de la distribución de entrenamiento.
- Dependencia de versiones antiguas de PyTorch y Transformers y de `trust_remote_code=True`, lo que implica ejecutar código del repositorio y complica el despliegue en entornos modernos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zapell/gloop-dnabert2
- Modelo base DNABERT-2-117M: https://huggingface.co/zhihan1996/DNABERT-2-117M
- Datos de G4 (BG4 ChIP, GEO GSE181373): https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE181373
- R-loopBase (fuente de picos R-ChIP): no disponible en la información proporcionada
- App web local del proyecto: mencionada en la model card, sin URL disponible
