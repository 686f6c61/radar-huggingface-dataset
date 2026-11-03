# tokiers/potion-science-32M

## Resumen

potion-science-32M es un modelo de embeddings estaticos publicado por el usuario tokiers en HuggingFace, construido con la libreria Model2Vec de Minish Lab. No es un modelo generativo: convierte texto en vectores densos de forma determinista mediante una tabla de embeddings por token, sin atencion ni capas transformer en tiempo de inferencia. Es una destilacion del sentence transformer `baai/bge-base-en-v1.5` mediante el pipeline de Tokenlearn, especializada en dominio cientifico.

El modelo se entrena sobre el dataset `scientific_papers` (articulos de Arxiv y Pubmed) y emplea un vocabulario mayor que su hermano potion-science-8M, lo que resulta util en tareas que requieren cobertura lexica especializada. Con 31.853.568 parametros totales (basicamente una matriz de embeddings), el coste computacional de codificar texto es practicamente el de una busqueda en tabla, lo que lo hace adecuado para busqueda semantica a gran escala, deduplicacion de corpus y filtrado en tiempo real sobre CPU.

Su relevancia actual reside en la relacion calidad/coste: los modelos estaticos de la familia potion superan ampliamente a otros embeddings estaticos en MTEB y se acercan a sentence transformers mucho mas pesados, con ordenes de magnitud menos de computo. La licencia MIT y el formato ONNX/safetensors facilitan su integracion en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Embeddings estaticos (Model2Vec, sin transformer en inferencia) |
| Parametros totales | 31.853.568 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos estaticos; el repo incluye safetensors y ONNX) |
| Idiomas soportados | no disponible (modelo destilado de bge-base-en, orientado a ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX; tokenizer en formato tokie (`tokenizer.tkz`) |

## Arquitectura y entrenamiento

Model2Vec sustituye el encoder transformer por una matriz de embeddings estatica: cada token del vocabulario tiene un vector aprendido y el embedding de una frase se obtiene por pooling (media, con ponderaciones posteriores). No hay atencion ni pasos autorregresivos, por lo que la codificacion es una operacion de lookup y agregacion, ejecutable en CPU a alta velocidad y vectorizable en GPU.

El entrenamiento sigue el pipeline de Tokenlearn: (1) destilacion inicial desde `baai/bge-base-en-v1.5` con Model2Vec; (2) generacion de datos de entrenamiento calculando embeddings medios de salida del teacher sobre un corpus grande (`scientific_papers`, articulos de Arxiv y Pubmed); (3) entrenamiento del modelo destilado sobre esos datos; y (4) re-regularizacion posterior ponderando tokens por frecuencia, aplicando PCA y finalmente SIF weighting. El vocabulario es mayor que el de potion-science-8M, lo que mejora la cobertura en terminologia cientifica. El repo incluye ademas un tokenizer preconstruido de tokie (`tokenizer.tkz`), que el autor declara 5x mas rapido que los tokenizers de HuggingFace y compatible como reemplazo directo.

## Capacidades

- Generacion de embeddings de texto para similitud semantica, busqueda y clustering.
- Codificacion estatica extremadamente rapida en CPU y GPU (sin pasos de atencion).
- Especializacion en vocabulario cientifico (Arxiv, Pubmed) gracias al corpus de entrenamiento.
- Compatible con la API `StaticModel.from_pretrained` de model2vec y con el ecosistema sentence-transformers en cuanto a uso de embeddings.
- Tokenizer tokie incluido (`tokenizer.tkz`) como alternativa rapida a los tokenizers de HuggingFace.
- Exportacion ONNX para despliegue en entornos sin PyTorch.
- No soporta generacion de texto, tool calling, agentes, vision ni audio: es exclusivamente un encoder de embeddings.

## Casos de uso

- Busqueda semantica sobre repositorios de articulos cientificos: indexar abstracts y cuerpos de papers de Arxiv/Pubmed y recuperar por similitud coseno; el vocabulario ampliado y el entrenamiento en dominio reducen el fallo en terminologia tecnica.
- Deduplicacion de corpus cientifico a gran escala: calcular embeddings de millones de documentos en CPU y agrupar por similitud, con un coste por documento de microsegundos frente a milisegundos de un transformer.
- Filtrado y triaje en pipelines de revision: clasificar candidatos por cercania a un conjunto de consultas de referencia antes de pasarlos a un modelo generativo o a un revisor humano.
- Recomendacion de literatura relacionada: construir un indice vectorial (FAISS, hnswlib) con este modelo y servir recomendaciones de papers similares en tiempo real.
- Enrutado de consultas en RAG de bajo coste: usar los embeddings para seleccionar la fuente o el indice adecuado antes de invocar un LLM, reduciendo latencia y coste.
- Clasificacion zero-shot ligera por prototipos: comparar embeddings de documentos contra embeddings de etiquetas descriptivas para categorizar textos cientificos sin entrenamiento adicional.
- Despliegue en entornos con recursos limitados: servicios en contenedores sin GPU o en el edge, donde un transformer no cabe en presupuesto de memoria o latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la pagina de resultados de Model2Vec (`results/README.md`) para las cifras de este modelo, pero no incluye tablas concretas de MTEB ni comparaciones numericas en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los pesos (31,8 M de parametros); en la practica el modelo cabe en memoria de cualquier GPU consumer y en RAM de CPU.
- GPU recomendadas: no requiere GPU; funciona en CPU. En GPU, cualquier modelo moderno (RTX 3060 en adelante, A100, H100) sirve, aunque el cuello de botella sera el pooling y el I/O, no el computo.
- Cabe en GPU consumer: si, en todas las GPU con al menos ~1 GB de memoria libre; tambien en Raspberry Pi y entornos similares.
- Opciones de despliegue: `model2vec` (PyTorch), ONNX Runtime, integracion con FAISS/hnswlib para indices vectoriales; no aplica vLLM, llama.cpp ni TGI porque no es un modelo generativo.
- Latencia y throughput: no se han publicado cifras concretas; el autor indica que los embeddings estaticos se calculan ordenes de magnitud mas rapido que un sentence transformer y que el tokenizer tokie es 5x mas rapido que los de HuggingFace.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tokiers/potion-science-32M | 31,8 M | Embeddings estaticos (Model2Vec) | no disponible | MIT | HuggingFace |
| minishlab/potion-science-8M | no disponible en la informacion | Embeddings estaticos (Model2Vec) | no disponible | no disponible en la informacion | HuggingFace |
| baai/bge-base-en-v1.5 | no disponible en la informacion | Sentence transformer (teacher) | no disponible | no disponible en la informacion | HuggingFace |

El modelo se posiciona frente a potion-science-8M por un vocabulario mayor y mas parametros, y frente a su teacher bge-base-en-v1.5 por un coste de inferencia mucho menor a cambio de cierta perdida de calidad en tareas fuera de dominio. No hay datos de rendimiento comparativo en la informacion disponible.

## Limitaciones y advertencias

- Es un modelo de embeddings, no generativo: no produce texto, no razona ni soporta tool calling.
- Entrenado sobre corpus cientifico en ingles (Arxiv, Pubmed); el rendimiento en otros dominios o idiomas puede degradarse notablemente y no se declaran idiomas soportados.
- Los embeddings estaticos ignoran el orden y el contexto de las palabras mas alla del pooling; pueden fallar en tareas que dependen de negacion, orden o composicionalidad fina.
- Riesgo de sesgo heredado del corpus cientifico y del teacher bge-base-en-v1.5, sin evaluaciones de sesgo publicadas.
- La longitud de contexto no esta documentada; conviene truncar o trocear textos largos.
- Licencia MIT permite uso comercial, pero el autor no ofrece garantias ni evaluaciones de robustez en produccion.
- El modelo es una publicacion de un usuario individual (tokiers) sobre la libreria Model2Vec de Minish Lab; la mantenibilidad y el soporte no estan garantizados.

## Enlaces

- HuggingFace: https://huggingface.co/tokiers/potion-science-32M
- Modelo hermano: https://huggingface.co/minishlab/potion-science-8M
- Teacher: https://huggingface.co/baai/bge-base-en-v1.5
- Dataset: https://huggingface.co/datasets/armanc/scientific_papers
- Repo Model2Vec: https://github.com/MinishLab/model2vec
- Repo Tokenlearn: https://github.com/MinishLab/tokenlearn
- Resultados Model2Vec: https://github.com/MinishLab/model2vec/blob/main/results/README.md
- Tutoriales Model2Vec: https://github.com/MinishLab/model2vec/tree/main/tutorials
- Tokenizer tokie: https://github.com/chonkie-inc/tokie
- Modelos Model2Vec en el hub: https://huggingface.co/models?library=model2vec
- Paper SIF weighting: https://openreview.net/pdf?id=SyK00v5xx
