# WinnieAmong/group1-sentiment-model

## Resumen

`WinnieAmong/group1-sentiment-model` es un clasificador binario de sentimiento (positivo/negativo) para resenas de cine en ingles, obtenido mediante fine-tuning de `distilbert-base-uncased`. Lo publica el usuario WinnieAmong como parte de un trabajo de grupo (se citan Mary Nabakka y Winnie Among como miembros), y esta pensado exclusivamente para analisis de sentimiento sobre texto en ingles del dominio cinematografico.

Tecnicamente es un modelo encoder-only de la familia DistilBERT, con 66.955.010 parametros totales (aproximadamente 67 M, coherente con la version destilada de BERT-base) y pesos en formato safetensors dentro de un repositorio de 0,3 GB. El entrenamiento se realizo sobre el dataset `stanfordnlp/imdb`, el corpus de referencia de 50.000 resenas etiquetadas, y el autor reporta 0,91444 de accuracy y 0,9153 de F1 sobre el conjunto de test.

Su relevancia es limitada y muy acotada: no es un modelo foundation ni compite en capacidades generales, sino un artefacto docente de clasificacion de texto que sirve como linea base barata y rapida de desplegar (menos de 1 GB de VRAM, ejecutable en CPU) para tareas de analisis de sentimiento en ingles. La model card contiene varios apartados marcados como `TODO` (miembros del grupo, dataset, ejemplos de prediccion, limitaciones), no declara licencia y no incluye informacion sobre el proceso de entrenamiento, por lo que su evaluacion debe hacerse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (DistilBERT, destilado de BERT-base) |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (limite estandar de `distilbert-base-uncased`; no confirmado de forma explicita en la model card) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos safetensors en precision completa) |
| Idiomas soportados | ingles (`en`) |
| Licencia | no disponible |
| Formato de pesos | safetensors (tamano del repo: 0,3 GB) |
| Tarea / pipeline | `text-classification` (`sentiment-analysis`) |
| Numero de clases | 2 (positivo / negativo) |
| Dataset de entrenamiento | `stanfordnlp/imdb` |
| Modelo base | `distilbert-base-uncased` |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder-only de tipo DistilBERT, la variante destilada de BERT-base que reduce el numero de capas de 12 a 6 y elimina el objetivo de next-sentence prediction, conservando el vocabulario WordPiece de `bert-base-uncased` y las representaciones ocultas de 768 dimensiones. Sobre esa base se anade una cabeza de clasificacion con dos etiquetas de salida para la tarea de analisis de sentimiento.

El fine-tuning se realizo sobre el dataset `stanfordnlp/imdb` (resenas de cine en ingles con etiqueta binaria). La informacion disponible no detalla hiperparametros, numero de epocas, tasa de aprendizaje, tamano de batch, numero de tokens de entrenamiento ni si se aplicaron tecnicas de regularizacion o ajuste fino selectivo; tampoco se documenta ningun proceso de RLHF, DPO o calibracion posterior. No se describe ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, destilacion adicional) mas alla del propio preentrenamiento destilado del modelo base.

## Capacidades

- Clasificacion binaria de sentimiento (positiva/negativa) sobre texto en ingles.
- Analisis de polaridad a nivel de documento o de fragmento, con salida de etiqueta y puntuacion de confianza.
- Inferencia rapida en CPU y en GPU de gama baja, adecuada para procesamiento por lotes de grandes volumenes de texto.
- Capacidad de razonamiento, generacion de texto, codigo, matematicas, vision o audio: no disponible (el modelo es exclusivamente un clasificador).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingues: no, el modelo esta entrenado y etiquetado solo para ingles.
- Modo "thinking", vision o audio: no disponible.

## Casos de uso

- Monitorizacion de reputacion de producto: procesar en lote resenas y comentarios de usuarios en ingles y agregar la polaridad por producto o por version para detectar caidas de satisfaccion.
- Moderacion y triaje de feedback: clasificar automaticamente tickets o comentarios como positivos o negativos para priorizar la cola de atencion al cliente.
- Analisis de sentimiento en investigacion social: etiquetar corpus de resenas o criticas en ingles como variable dependiente en estudios de opinion, con la ventaja de que el modelo corre en CPU y permite reprocesar el corpus completo.
- Linea base en experimentos de NLP: servir como referencia (0,91444 de accuracy, 0,9153 de F1 en IMDB) frente a la cual comparar modelos mas grandes o tecnicas de ajuste fino en un pipeline de experimentacion.
- Enriquecimiento de datasets: preetiquetar grandes volumenes de texto en ingles para su posterior revision humana y correccion, reduciendo el coste de anotacion manual.
- Filtrado previo en pipelines de datos: descartar o marcar documentos con polaridad extrema antes de pasarlos a un modelo generativo mas caro, ahorrando tokens de contexto y coste de inferencia.
- Demo educativa o prototipo: desplegar un endpoint de clasificacion de sentimiento en un cuaderno o una API ligera para validar un flujo de producto sin infraestructura GPU.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el conjunto de test de IMDB:

| Metrica | Valor |
|---|---|
| Accuracy | 0,91444 |
| F1 | 0,9153 |

No se han publicado en la informacion disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K, etc.), ni comparaciones directas con otros modelos, ni metricas de precision/recall por clase, matriz de confusion o calibracion. Tampoco se especifica el tamano exacto del split de test utilizado para calcular estas cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en FP32 (unos 268 MB de pesos) y aproximadamente 134 MB en FP16. Cabe holgadamente incluso en GPUs integradas.
- Memoria en CPU: el modelo completo se ejecuta en RAM en torno a 300 MB, con requisitos adicionales minimos para el tokenizador y el batch.
- GPU recomendadas: no requiere GPU. Funciona correctamente en CPU; cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) lo ejecuta con latencias de milisegundos por muestra.
- Cabe en cualquier GPU consumer: si, incluidas GPU de portatil con 4 GB o menos, y en dispositivos de borde con suficiente RAM.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, `optimum`/ONNX Runtime para acelerar en CPU, TorchScript, y servidores de inferencia ligeros como FastAPI o Triton. vLLM y TGI no estan orientados a clasificadores encoder-only de este tamano y no aportan ventaja.
- Latencia y throughput: no disponible (no se han publicado mediciones en la informacion proporcionada). Por tamano, se espera un throughput del orden de cientos a miles de muestras por segundo en CPU moderna con batch, pero es una estimacion no verificada.
- Cuantizacion: no se publican pesos GGUF ni int8; seria necesario convertir los pesos safetensors para desplegar en `llama.cpp` u Ollama, que ademas no son herramientas pensadas para clasificadores BERT.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento en IMDB |
|---|---|---|---|---|---|
| `WinnieAmong/group1-sentiment-model` | 66,96 M | 512 (estandar DistilBERT) | no disponible | safetensors | Accuracy 0,91444 / F1 0,9153 (reportado por el autor) |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66,96 M | 512 | Apache-2.0 (modelo base) | safetensors / PyTorch | no disponible en la informacion |
| `textattack/bert-base-uncased-imdb` | ~110 M | 512 | Apache-2.0 (modelo base) | PyTorch | no disponible en la informacion |
| `roberta-base` ajustado a IMDB | ~125 M | 514 | MIT (modelo base) | PyTorch / safetensors | no disponible en la informacion |

Las licencias indicadas para los modelos alternativos corresponden a sus modelos base publicados; conviene verificar la ficha concreta de cada checkpoint antes de un uso comercial. No se dispone de cifras de benchmark comparables para el resto de modelos en la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Entrenado unicamente con resenas de cine en ingles: el rendimiento fuera de ese dominio (tecnologia, finanzas, redes sociales) o en otros idiomas no esta garantizado y probablemente degrade de forma significativa.
- La propia model card advierte de dificultades con el sarcasmo y con texto mixto luganda-ingles, lo que sugiere un fallo esperado en registros informales y en code-switching.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de clasificaciones erroneas con alta confianza en entradas ambiguas o fuera de distribucion.
- No se declara licencia: no hay permiso explicito de uso comercial, lo que supone un bloqueo legal para integrarlo en produccion sin aclaracion previa del autor.
- La model card contiene apartados incompletos (`TODO`) sobre miembros del grupo, dataset, ejemplos de prediccion y limitaciones, lo que reduce la trazabilidad del entrenamiento.
- No se documentan hiperparametros, semillas, numero de epocas ni el split de test utilizado, por lo que las metricas reportadas no son reproducibles tal cual.
- No se publican metricas por clase ni matriz de confusion; con un dataset razonablemente balanceado como IMDB el F1 agregado puede ocultar diferencias de recall entre positivo y negativo.
- Truncamiento a 512 tokens: resenas o documentos mas largos se recortan, con perdida de contexto y posible sesgo hacia la parte inicial del texto.
- Posible sesgo heredado del corpus IMDB (resenas de cine de una franja temporal concreta, predominantemente en ingles y con una distribucion de opiniones especifica), que puede no reflejar el lenguaje de otros mercados.
- Sin cuantizaciones publicadas ni soporte declarado para runners tipo GGUF; el despliegue en entornos ligeros requiere conversion manual de los pesos.
- No apto para decisiones de alto riesgo (por ejemplo, moderacion automatizada sin revision humana) dado el reducido tamano del modelo y la ausencia de evaluacion de robustez.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/WinnieAmong/group1-sentiment-model
- Dataset de entrenamiento (IMDB): https://huggingface.co/datasets/stanfordnlp/imdb
- Modelo base: https://huggingface.co/distilbert-base-uncased
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Paper de BERT (Devlin et al., 2018): https://arxiv.org/abs/1810.04805
- Nota: la busqueda web realizada no devolvio resultados tecnicos relevantes sobre este modelo (solo contenido no relacionado), por lo que no se incluyen enlaces adicionales de papers, blogs, repositorios o demos.
