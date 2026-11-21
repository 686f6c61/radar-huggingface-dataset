# TahiraAbbas/gpt2-wikitext

## Resumen
`TahiraAbbas/gpt2-wikitext` es un ajuste fino del modelo `openai-community/gpt2` (GPT-2 base, 124,4 millones de parametros) sobre el conjunto de datos WikiText-2, compuesto por articulos de Wikipedia en ingles. El autor es TahiraAbbas y el modelo se publica con licencia MIT. Su proposito es la generacion de texto en ingles mediante prediccion del siguiente token, un caso de uso clasico de ajuste fino sobre un corpus monolingue.

El modelo es un transformer decoder-only de la familia GPT-2, con la misma arquitectura y tamano que el GPT-2 base original (124M parametros, 12 capas, 12 cabezas de atencion, dimension de embedding 768 y contexto de 1024 tokens). No introduce cambios arquitectonicos: se trata de un fine-tuning supervisado sobre WikiText-2 para adaptar la distribucion de salida al estilo enciclopedico de Wikipedia.

Su relevancia es limitada en el panorama actual de modelos grandes, pero resulta util como referencia didactica, como baseline ligero para tareas de generacion de texto en ingles y como ejemplo de ajuste fino de GPT-2 sobre un dataset pequeno. No compite en capacidades con modelos contemporaneos de mayor tamano ni con arquitecturas MoE o modelos con contexto extendido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2) |
| Parametros totales | 124.439.808 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1024 tokens (heredada de GPT-2) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; se puede cuantizar a FP16, INT8 o INT4 con herramientas externas) |
| Idiomas soportados | ingles (monolingue) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
La arquitectura es identica a la de GPT-2 base: un transformer decoder-only con 12 capas, 12 cabezas de atencion, dimension oculta de 768 y embeddings de posicion aprendidos con ventana maxima de 1024 tokens. El objetivo de entrenamiento es la prediccion autorregresiva del siguiente token con entropia cruzada.

El ajuste fino se realizo sobre el dataset `Salesforce/wikitext`, en concreto sobre WikiText-2, un corpus de articulos de Wikipedia en ingles. La model card indica que se entreno sobre "un pequeno subconjunto de WikiText-2", sin especificar numero de tokens, numero de pasos, hiperparametros ni si hubo etapas de RLHF o DPO. No se documentan innovaciones tecnicas adicionales (no hay decodificacion especulativa, atencion lineal ni modulos de vision o audio).

## Capacidades
- Generacion de texto autorregresiva en ingles a partir de un prompt.
- Continuacion de frases y parrafos con estilo enciclopedico, heredado del corpus WikiText-2.
- Prediccion del siguiente token con decodificacion greedy, beam search o sampling (top-k, top-p, temperatura).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso de forma nativa.
- Capacidad multilingue practicamente nula: el autor declara que solo funciona en ingles.
- No dispone de modo "thinking", vision, audio ni otras capacidades multimodales.
- No se documenta soporte nativo de plantillas de chat ni de tokens especiales de rol.

## Casos de uso
- Generacion de texto de relleno en ingles para prototipos y demos: el modelo puede producir continuaciones plausibles de frases cortas, util para maquetas de interfaz o pruebas de pipelines de generacion.
- Baseline academico para experimentos de fine-tuning: sirve como punto de comparacion en trabajos que estudian el efecto del ajuste fino de GPT-2 sobre dominios especificos.
- Aumento de datos sinteticos en ingles: se puede usar para generar variaciones de texto con estilo enciclopedico en tareas de clasificacion o recuperacion de informacion de baja exigencia.
- Educacion y docencia: ejemplo practico de como cargar un modelo con `transformers`, ejecutar `pipeline("text-generation")` y observar el efecto del fine-tuning sobre un corpus concreto.
- Pruebas de infraestructura de inferencia: por su tamano reducido (0,5 GB en safetensors) es util para validar despliegues en CPU, GPUs consumer o entornos con recursos limitados.
- Generacion de descripciones breves de articulos de Wikipedia: dado un titulo o una primera frase, el modelo puede producir un parrafo de continuacion con estilo similar al corpus de entrenamiento, siempre con revision humana por el riesgo de alucinacion.
- Experimentos de cuantizacion y optimizacion: al ser un modelo pequeno, permite medir latencia y throughput en distintas configuraciones (FP32, FP16, INT8, INT4) sin necesidad de hardware de gama alta.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en FP32: aproximadamente 0,5 GB (124M parametros x 4 bytes), mas overhead de activaciones y cache KV.
- VRAM estimada en FP16: aproximadamente 0,25 GB de pesos, mas overhead.
- VRAM estimada en INT8: aproximadamente 0,12 GB de pesos, mas overhead.
- VRAM estimada en INT4: aproximadamente 0,06 GB de pesos, mas overhead.
- Cabe holgadamente en cualquier GPU consumer (RTX 3060, RTX 4060, RTX 4090, GTX 1660, etc.) e incluso en CPU.
- GPUs de datacenter (A100, H100) no son necesarias; el modelo no aprovecha su capacidad.
- Opciones de despliegue: `transformers` (pipeline de text-generation), llama.cpp (requiere conversion a GGUF), Ollama (previa conversion), vLLM (soporte para GPT-2), TGI (soporte para GPT-2).
- Latencia y throughput: no se han publicado mediciones concretas en la informacion disponible. Por tamano, se espera inferencia en tiempo real en CPU moderna y muy alta en GPU consumer, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| TahiraAbbas/gpt2-wikitext | 124,4M | 1024 | MIT | Hugging Face | Fine-tuning de GPT-2 sobre WikiText-2 |
| openai-community/gpt2 | 124,4M | 1024 | MIT | Hugging Face | Modelo base original, sin fine-tuning sobre WikiText-2 |
| gpt2-medium | 355M | 1024 | MIT | Hugging Face | Version mas grande de la familia GPT-2, mayor capacidad |
| distilgpt2 | 82M | 1024 | Apache 2.0 | Hugging Face | Version destilada de GPT-2, mas rapida y ligera |

No se dispone de datos de benchmarks comparativos publicados en la informacion proporcionada para establecer diferencias cuantitativas de rendimiento entre estos modelos.

## Limitaciones y advertencias
- Modelo monolingue en ingles: no funciona correctamente en castellano ni en otros idiomas.
- Riesgo alto de alucinacion: el autor advierte que el texto generado puede ser repetitivo o factualmente incorrecto.
- Entrenado sobre un subconjunto pequeno de WikiText-2, lo que limita la diversidad y calidad de las continuaciones.
- Contexto maximo de 1024 tokens, insuficiente para tareas que requieran documentos largos.
- Sin soporte de tool calling, agentes ni razonamiento multi-paso.
- Sin datos publicados sobre sesgos especificos, pero al derivar de GPT-2 y de Wikipedia en ingles es probable que herede sesgos del corpus original y del dominio enciclopedico.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias sobre la calidad o idoneidad del modelo para produccion.
- No recomendado para tareas criticas sin revision humana: la calidad de generacion es limitada por el tamano del modelo y del dataset de ajuste.
- No se documentan hiperparametros de entrenamiento ni numero de tokens vistos, lo que dificulta la reproducibilidad.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/TahiraAbbas/gpt2-wikitext
- Modelo base GPT-2: https://huggingface.co/openai-community/gpt2
- Dataset WikiText: https://huggingface.co/datasets/Salesforce/wikitext
- Paper de GPT-2 (OpenAI): https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf
- Paper de WikiText (Merity et al.): https://arxiv.org/abs/1609.07843
- Documentacion de transformers (pipeline text-generation): https://huggingface.co/docs/transformers/main/en/main_classes/pipelines#transformers.TextGenerationPipeline
