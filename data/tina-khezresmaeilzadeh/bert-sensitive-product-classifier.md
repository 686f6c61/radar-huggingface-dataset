# tina-khezresmaeilzadeh/bert-sensitive-product-classifier

## Resumen

El BERT sensitive-product classifier es un modelo de clasificación de texto obtenido por fine-tuning de `google-bert/bert-base-uncased` (109.483.778 parámetros, arquitectura transformer encoder). Lo desarrolla Tina Khezresmaeilzadeh (Universidad del Sur de California, según la autoría del paper asociado) y su función es binaria: determinar si un producto de Amazon es "sensible", es decir, si comprarlo revela implícitamente una condición médica o una preocupación de salud, o si por el contrario es "no sensible".

El modelo no es un recomendador ni un LLM generativo: es el componente de ofuscación en el dispositivo dentro de un sistema de recomendación de productos basado en LLM que preserva la privacidad. Los productos que el clasificador marca como sensibles se quedan en el dispositivo del usuario y no se envían al recomendador LLM del servidor, de modo que el servidor no recibe señales sobre la salud del usuario a través de su historial de compras. Es relevante porque aborda un vector de fuga de información poco tratado: la inferencia de condiciones médicas a partir de metadatos de productos cotidianos.

El modelo es pequeño (0,4 GB en safetensors), está entrenado únicamente en inglés y su licencia es MIT. Se publicó en noviembre de 2026 junto con el código del sistema y el paper arXiv:2505.00951.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base, 12 capas, 768 de dimensión oculta) |
| Parametros totales | 109.483.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (límite de BERT base); el paper trunca a 128 tokens y el entrenamiento usó 256 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors en precisión completa; no se publican variantes GGUF/ONNX) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 0,4 GB) |

## Arquitectura y entrenamiento

Se trata de un `BertForSequenceClassification` estándar sobre `bert-base-uncased`, con dos etiquetas de salida (sensible / no sensible). No incorpora innovaciones arquitectónicas: es un fine-tuning de clasificación sobre un encoder BERT preentrenado.

El conjunto de entrenamiento son 10.012 productos muestreados de las categorías Health & Household, Health & Personal Care y Beauty & Personal Care de Amazon Reviews 2023, etiquetados por GPT-4o con un prompt few-shot descrito en el paper a partir únicamente de metadatos del producto; 1.490 de ellos son sensibles. El etiquetado se hizo con la noción amplia de "sensible" del prompt, que incluye productos de alivio sintomático cotidiano. El procedimiento fue: focal loss con pesos de clase (gamma = 2), 5 épocas, learning rate 2e-5, weight decay 0,01, batch de 16, entradas truncadas a 256 tokens, split 70/20/10 estratificado por etiqueta y selección del checkpoint por F1 de validación. No se reporta RLHF ni DPO (no aplica a un clasificador).

El formato de entrada es específico y debe respetarse: título del producto, categoría principal y lista de características con el esquema de plantilla documentado en la model card (`bert_text` en `privrec/obfuscators.py`).

## Capacidades

- Clasificación binaria de productos de Amazon como sensibles o no sensibles a partir de título, categoría principal y características.
- Salida de probabilidad calibrada de forma aproximada (se aplica umbral 0,5; en el ejemplo de la model card un monitor de glucosa obtiene ~0,95 y una botella de agua ~0,11).
- Procesamiento por lotes con padding y truncación (el ejemplo oficial usa `padding=True` y `max_length=128`).
- Integración como obfuscador en el dispositivo dentro de un pipeline de recomendación con LLM (deobfuscación local).
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo thinking: es un clasificador, no un modelo generativo.
- Capacidad multilingüe: solo inglés.

## Casos de uso

- Ofuscación en el dispositivo para recomendadores de productos: el clasificador marca los productos sensibles antes de construir la consulta al LLM del servidor; esos ítems no salen del dispositivo, de modo que el servidor no puede inferir una condición médica a partir de las compras enviadas.
- Filtrado previo en pipelines de analítica de compras: antes de agregar historiales de compra a un data warehouse o a un sistema de perfilado, el modelo permite etiquetar qué ítems son sensibles y aplicarles una política de retención o anonimización distinta.
- Cumplimiento de privacidad en e-commerce: sirve como control técnico para demostrar minimización de datos en flujos donde se envían metadatos de producto a servicios externos (LLM, motores de recomendación, APIs de terceros).
- Enriquecimiento de catálogos: clasificar automáticamente productos de las categorías de salud y belleza con una etiqueta de sensibilidad para segmentar catálogos, ajustar políticas de publicidad o restringir recomendaciones cruzadas.
- Investigación en privacidad diferencial y ofuscación: el modelo y sus etiquetas (`data/obfuscator_training_labels.jsonl`) permiten reproducir y comparar estrategias de ofuscación frente a alternativas como eliminar categorías enteras (el paper reporta F1 0,33 para ese enfoque frente a 0,54 del clasificador).
- Detección de señales de salud en texto corto de producto: con 109 M de parámetros y entradas de 128 tokens, es viable en CPU o GPU de gama baja dentro de aplicaciones móviles o de escritorio, sin depender de un servicio remoto.

## Benchmarks y rendimiento

| Evaluación | F1 | Precision | Recall |
|---|---|---|---|
| Split de validación (selección de checkpoint) | 0,868 | 0,815 | 0,928 |
| Evaluación del paper (25.899 entradas de historial de 1.295 usuarios, frente a etiquetas independientes de Qwen3.5-9B) | 0,54 | 0,42 | 0,75 |
| Baseline del paper: eliminar las tres categorías de salud y belleza | 0,33 | no disponible | no disponible |

El paper indica además que el clasificador marca el 17% de las entradas del historial y detecta el 91% de las entradas estrictamente sensibles (productos que tratan, monitorizan o gestionan una condición específica). Los resultados de validación son optimistas por construcción, ya que se usaron para seleccionar el checkpoint. No se han publicado resultados en benchmarks estándar de NLP (MMLU, GLUE, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 1 GB en fp32 (109 M de parámetros, ~0,44 GB de pesos) más activaciones; en fp16 ~0,22 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria; no requiere A100 ni H100. Funciona en RTX 4090, RTX 3060, T4 y GPUs integradas.
- Cabe en GPU de consumo y en CPU: es un modelo apto para inferencia en el dispositivo, tal como exige su función de obfuscador local.
- Opciones de despliegue: `transformers` con PyTorch (ruta documentada), exportación a ONNX u otros runtimes de inferencia; no se publican pesos GGUF ni integración con Ollama, vLLM o TGI (vLLM y TGI no son adecuados para un clasificador de este tamaño).
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, se espera latencia de milisegundos por lote en CPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BERT sensitive-product classifier | 109,5 M | 512 tokens (uso a 128) | Clasificación binaria de sensibilidad de producto | MIT | Hugging Face |
| `google-bert/bert-base-uncased` (modelo base) | 110 M | 512 tokens | MLM / encoder genérico | Apache 2.0 | Hugging Face |
| Eliminación de categorías de salud y belleza (baseline del paper) | no aplica | no aplica | Filtrado por regla | no aplica | Implementado en el código del paper |
| Etiquetado con Qwen3.5-9B (referencia del paper) | 9 B (aprox.) | no disponible | Etiquetado de sensibilidad | no disponible | Usado solo como referencia de evaluación |

No se dispone de otros clasificadores públicos específicos de sensibilidad de producto para una comparación directa en la información proporcionada.

## Limitaciones y advertencias

- La noción de "sensible" es la del prompt de etiquetado e incluye productos de alivio sintomático cotidiano; en una comprobación humana ciega de 200 productos, el anotador aplicó un criterio más estrecho, lo que indica desalineación con la intuición humana.
- Entrenado solo con tres categorías de salud y belleza; los productos que falla son mayoritariamente de sensibilidad leve, y el rendimiento fuera de esas categorías no está validado.
- Clasifica productos de uno en uno: no evita que un servidor infiera una condición a partir del conjunto de productos no sensibles que sí se envían (ataque de agregación).
- Precisión baja en la evaluación realista del paper (0,42), con un 17% de entradas marcadas; un uso con umbral distinto de 0,5 requiere recalibración.
- Solo inglés: textos de producto en otros idiomas no están cubiertos.
- Riesgo de alucinación no aplica como tal (es un clasificador), pero sí de falsos positivos y negativos con impacto en la privacidad: un falso negativo envía al servidor un producto sensible.
- Licencia MIT: permite uso comercial y modificación sin restricciones de copyleft, pero no hay garantías del autor.
- El modelo se publicó con 0 descargas y 0 likes; no hay validación comunitaria independiente de su comportamiento.
- Depende de un formato de entrada concreto (título, categoría principal, características); desviarse de la plantilla puede degradar las predicciones.

## Enlaces

- Hugging Face: https://huggingface.co/tina-khezresmaeilzadeh/bert-sensitive-product-classifier
- Paper (arXiv): https://arxiv.org/abs/2505.00951
- Código del sistema: https://github.com/tinakhezresmaeilzadeh/privacy-preserving-llm-rec
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
