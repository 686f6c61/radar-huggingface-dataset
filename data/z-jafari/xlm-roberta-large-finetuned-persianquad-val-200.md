# Z-Jafari/xlm-roberta-large-finetuned-PersianQuAD-val-200

## Resumen

xlm-roberta-large-finetuned-PersianQuAD-val-200 es un modelo de respuesta a preguntas extractiva (question answering) obtenido por fine-tuning de FacebookAI/xlm-roberta-large sobre un corpus de preguntas y respuestas en persa, presumiblemente derivado de PersianQuAD. Lo publica el usuario Z-Jafari en Hugging Face bajo licencia MIT y esta pensado para localizar la respuesta a una pregunta dentro de un parrafo de contexto en lengua persa.

El modelo parte de la arquitectura XLM-RoBERTa large, un transformer encoder-only multilingue de 558.842.882 parametros con tokenizador SentencePiece. El fine-tuning se realizo con el Trainer de transformers durante 3 epocas, con learning rate 2e-05, batch size 16, AdamW fused y precision mixta nativa (AMP), alcanzando una perdida de validacion de 0,7280 y metricas declaradas de exact match 88,8 y F1 90,92 sobre el conjunto de evaluacion.

Es relevante como referencia practica para tareas de QA extractiva en persa, un idioma con menos recursos que el ingles o el castellano, y como ejemplo de reutilizacion de un encoder multilingue de gran tamano para un dominio linguistico concreto. La model card es auto-generada y no documenta la composicion del dataset ni los usos previstos, por lo que debe tratarse con cautela en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (XLM-RoBERTa large) |
| Parametros totales | 558.842.882 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (XLM-RoBERTa large admite hasta 512 tokens de entrada, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion dinamica de PyTorch y con conversion a otros formatos, no documentado por el autor) |
| Idiomas soportados | no disponible (modelo base multilingue; fine-tuning orientado a persa) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de FacebookAI/xlm-roberta-large, un transformer encoder-only con atencion bidireccional y embeddings posicionales relativos, preentrenado de forma multilingue con enmascaramiento de tokens. Sobre esa base se anade una cabeza de question answering (clasificacion de inicio y fin de la respuesta sobre la secuencia de contexto) y se entrena de extremo a extremo.

Los hiperparametros documentados son: learning rate 2e-05 con scheduler lineal, batch size de entrenamiento y evaluacion de 16, 3 epocas (3951 pasos totales), semilla 42, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-08, y entrenamiento con AMP nativo. La evolucion de la perdida muestra sobreajuste a partir de la tercera epoca: la perdida de entrenamiento baja de 0,8063 a 0,3282 mientras la de validacion toca minimo en la epoca 2 (0,6424) y sube a 0,7280 en la epoca 3. No se documenta el dataset de entrenamiento, su tamano, su composicion ni si hubo aumentacion de datos o limpieza adicional.

## Capacidades

- Respuesta a preguntas extractiva: dado un contexto y una pregunta en persa, devuelve el fragmento de texto que contiene la respuesta, con puntuaciones de inicio y fin.
- Comprension lectora mono-turno: razonamiento sobre un unico pasaje, sin memoria entre consultas.
- Capacidad multilingue heredada del modelo base XLM-RoBERTa, aunque el fine-tuning esta orientado al persa y no se documenta el rendimiento en otros idiomas.
- No soporta tool calling ni function calling: es un encoder de QA, no un modelo generativo con instrucciones.
- No soporta agentes ni razonamiento multi-paso mas alla de la localizacion de un span.
- No dispone de modo thinking, vision ni audio.
- No genera texto libre: su salida es un span del contexto de entrada.

## Casos de uso

- Busqueda de respuestas en documentacion interna en persa: indexar manuales o bases de conocimiento y usar el modelo para extraer el pasaje exacto que responde a la consulta del empleado, con umbral de confianza sobre las puntuaciones de span.
- Atencion al cliente sobre FAQ en persa: emparejar cada pregunta entrante con el articulo de ayuda correspondiente y devolver la frase concreta que resuelve la duda, reduciendo el tiempo de primera respuesta.
- Extraccion de campos en formularios y contratos: localizar valores concretos (fechas, importes, nombres) dentro de clausulas en persa para pipelines de digitalizacion documental.
- Asistente de lectura para estudiantes: integrar el modelo en una interfaz que, dado un texto academico en persa, responda preguntas de comprension senalando el fragmento relevante.
- Enriquecimiento de bases de datos periodisticas: extraer respuestas a preguntas predefinidas (quien, cuando, donde) de articulos en persa para construir fichas estructuradas.
- Evaluacion comparativa de sistemas de QA en persa: usar el checkpoint como referencia de calidad (EM 88,8 y F1 90,92 declarados) frente a otros modelos o variantes del mismo autor, como la version base publicada en el mismo perfil.

## Benchmarks y rendimiento

La model card declara los siguientes resultados sobre el conjunto de evaluacion, sin especificar su composicion ni el split exacto. El model-index no contiene entradas adicionales.

| Metrica | Valor declarado |
|---|---|
| Exact match | 88,8 |
| F1 | 90,91812631812626 |
| Loss de evaluacion | 0,7280 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni comparaciones oficiales con modelos alternativos.

## Requisitos de hardware

- VRAM estimada en fp32: alrededor de 2,2 GB solo para pesos, mas activaciones y buffer de inferencia; en la practica, entre 4 y 6 GB para lotes pequenos con contexto de hasta 512 tokens.
- VRAM estimada en fp16/bf16: alrededor de 1,1 GB para pesos, con un total practico de 2 a 4 GB.
- GPU recomendadas: cualquier GPU con 8 GB o mas, como RTX 3060, RTX 4060, RTX 4090, A10, L4, A100 o H100. El modelo cabe sobradamente en GPU de consumo.
- Despliegue: transformers con pipeline de question-answering, TorchScript, ONNX Runtime, o servidores de inferencia como TGI y vLLM (este ultimo con soporte limitado para modelos encoder-only). Tambien es viable en CPU para cargas bajas.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento QA en persa | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| xlm-roberta-large-finetuned-PersianQuAD-val-200 | 558.842.882 | no disponible | EM 88,8 / F1 90,92 (declarado) | MIT | Hugging Face |
| xlm-roberta-base-finetuned-PersianQuAD-val-None | no disponible (base XLM-R, ~278 M) | no disponible | no disponible | no disponible | Hugging Face (mismo autor) |
| xlm-roberta-large-finetuned-PersianQuAD_Factoid_Test | no disponible | no disponible | no disponible | no disponible | Hugging Face (mismo autor) |

Las dos alternativas listadas pertenecen al mismo autor y no publican metricas comparables en la informacion disponible, por lo que la comparacion cuantitativa no puede establecerse.

## Limitaciones y advertencias

- La model card es auto-generada y no documenta el dataset de entrenamiento, el split de evaluacion ni los usos previstos, lo que impide auditar la procedencia de los datos y el posible sesgo de seleccion.
- Las metricas de EM y F1 estan declaradas por el autor sin verificacion independiente y sin especificar el conjunto de test; no deben tomarse como rendimiento garantizado en dominios nuevos.
- Sobreajuste observable: la perdida de validacion empeora en la tercera epoca, por lo que el checkpoint publicado no es necesariamente el mejor de la curva de entrenamiento.
- Riesgo de alucinacion de span: al ser un modelo extractivo, siempre devuelve un fragmento del contexto aunque la respuesta no este presente; es imprescindible aplicar umbrales de confianza y validacion posterior.
- Limitacion de contexto: el modelo base XLM-RoBERTa large admite como maximo 512 tokens de entrada, lo que restringe el tamano del pasaje y obliga a trocear documentos largos.
- Idioma: el fine-tuning esta orientado al persa; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea inferior al del modelo base sin ajustar.
- Licencia MIT: permite uso comercial y modificacion, pero no se ofrece ninguna garantia por parte del autor.
- Ausencia de soporte para generacion, tool calling o agentes: no es adecuado como sustituto de un LLM generativo en pipelines conversacionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Z-Jafari/xlm-roberta-large-finetuned-PersianQuAD-val-200
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-large
- Variante base del mismo autor: https://huggingface.co/Z-Jafari/xlm-roberta-base-finetuned-PersianQuAD-val-None
- Variante Factoid Test del mismo autor: https://huggingface.co/Z-Jafari/xlm-roberta-large-finetuned-PersianQuAD_Factoid_Test
