# yanpeng051821/qwen3.5-0.8b-document-ocr-lora

## Resumen

El modelo `yanpeng051821/qwen3.5-0.8b-document-ocr-lora` es un adaptador LoRA de investigación desarrollado por el usuario yanpeng051821 para transcribir imágenes de una única página de documento a Markdown, incluyendo tablas en HTML y fórmulas en LaTeX. No se trata de un checkpoint fusionado ni de un modelo autónomo, sino de un adaptador PEFT que requiere el modelo base Qwen3.5-0.8B (con un commit concreto fijado) para funcionar. Tampoco es un lanzamiento oficial de Qwen ni de Ai2.

El adaptador resuelve un problema acotado: la conversión de imagen de página a texto estructurado (OCR con preservación de estructura) con un modelo de muy pequeño tamaño (0,8 mil millones de parámetros). Su relevancia radica en que demuestra que un LoRA de rango muy bajo (r=4) sobre un modelo compacto puede mejorar sustancialmente la transcripción de documentos frente al modelo base, aunque con limitaciones claras de robustez y sin datos de benchmarks estándar publicados.

La información disponible es escasa: no se detallan los idiomas soportados, no hay resultados en benchmarks convencionales como MMLU o HumanEval, y la evaluación se limita a dos conjuntos pequeños y separados, cuyos resultados el propio autor advierte que no son puntuaciones de leaderboard.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer multimodal image-text-to-text; el LoRA se aplica a las proyecciones lineales Q/V en seis capas de lenguaje con atención completa |
| Parametros totales | No disponible (el adaptador es LoRA r=4 sobre un modelo base de 0,8B; el número de parámetros del adaptador no se especifica) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el entrenamiento usó una longitud máxima de secuencia de 2.898 tokens; la ventana del modelo base no se detalla) |
| Tipos de cuantizacion | No disponible (el quickstart indica BF16) |
| Idiomas soportados | No disponible (el autor indica que el lanzamiento no establece cobertura multilingüe) |
| Licencia | Apache-2.0 (el modelo base y los datasets mantienen sus propios términos) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen3.5-0.8B, un modelo multimodal de tipo image-text-to-text. El LoRA tiene rango 4 y alpha 8, y se aplica exclusivamente a las proyecciones lineales Q/V en seis capas de lenguaje con atención completa. Los pesos del modelo base, tanto de lenguaje como de visión, permanecieron congelados durante el entrenamiento. El adaptador se distribuye como pesos PEFT en safetensors y requiere el commit fijado del modelo base en el Hub.

El entrenamiento consistió en una época con 500 actualizaciones del optimizador sobre 2.000 páginas, con 64 páginas separadas para validación con teacher forcing. Se usó micro-batch de 2 y dos pasos de acumulación, con una longitud máxima de secuencia de entrenamiento de 2.898 tokens. La NLL final de validación fue de 0,107636 sobre 44.452 tokens supervisados, métrica que el autor aclara explícitamente que no es una puntuación de precisión OCR. Las transcripciones e indexación de origen provienen de Ai2 olmOCR-mix-1025 (partición `00_documents/train`) y las páginas pre-renderizadas de DBlake-BoxedLogic/Image-2-Markdown, ambos datasets etiquetados como ODC-BY 1.0. No se redistribuyen imágenes de páginas, documentos fuente ni transcripciones.

## Capacidades

- Transcripción de una única imagen de página de documento a Markdown.
- Generación de tablas en HTML dentro de la salida Markdown.
- Generación de fórmulas matemáticas en LaTeX.
- Procesamiento de imagen a texto (pipeline image-text-to-text).
- Decodificación greedy con el modo de razonamiento (thinking) desactivado en el script de ejemplo.
- Presupuesto de imagen de 1.048.576 píxeles y límite de 3.072 tokens nuevos en la configuración de referencia.
- No se documenta soporte de tool calling, function calling, agentes ni multi-step reasoning.
- No se documenta soporte de audio ni otras capacidades especiales más allá de la visión para OCR.

## Casos de uso

- Digitalización de documentos escaneados de una sola página: el adaptador convierte la imagen en Markdown con estructura preservada, útil para pipelines de ingesta documental donde se requiere texto plano enriquecido con tablas y fórmulas.
- Extracción de tablas de informes y facturas: la salida en HTML permite reconstruir tablas dentro del Markdown, adecuado para documentos administrativos de una página con tablas simples.
- Conversión de apuntes científicos con fórmulas: la generación de LaTeX facilita llevar ecuaciones de páginas escaneadas a entornos de documentación técnica o cuadernos de investigación.
- Preprocesado para sistemas RAG: al generar Markdown limpio, el resultado puede indexarse en bases vectoriales o motores de búsqueda documental, aunque requiere verificación previa contra la imagen.
- Prototipado e investigación en OCR de bajo coste: al ser un LoRA de rango 4 sobre un modelo de 0,8B, sirve para experimentar con ajuste fino eficiente en tareas de parsing documental con recursos limitados.
- Evaluación comparativa de adaptadores: útil como referencia en estudios que midan la mejora de un LoRA pequeño frente al modelo base en tareas de transcripción, dado que el autor publica la receta y el registro de evaluación.

## Benchmarks y rendimiento

Los resultados publicados por el autor comparan el modelo base sin LoRA (B0) y con LoRA (S1), usando el mismo modelo base, imágenes, prompt y decodificación. Proceden de dos conjuntos pequeños y separados, y no son puntuaciones de leaderboard.

| Metrica | B0 | S1 |
| --- | ---: | ---: |
| Tasa de edición de caracteres in-domain frente a transcripciones del profesor, 31 páginas puntuadas (menor es mejor) | 81,20% | 28,95% |
| Distancia de edición de texto externa, 12 páginas (menor es mejor) | 0,392 | 0,215 |
| Distancia de edición de fórmulas externa, 5 páginas (menor es mejor) | 0,724 | 0,511 |
| TEDS de tablas externas, 5 tablas (mayor es mejor) | 0,950 | 0,758 |
| Distancia de edición de orden de lectura externa, 12 páginas (menor es mejor) | 0,310 | 0,308 |

El diagnóstico externo usa un subconjunto de 12 páginas de OmniDocBench. El autor señala que una tabla no detectada explica el descenso en la puntuación de tablas en esta muestra pequeña. La concordancia con el profesor no es precisión OCR verificada por humanos, y la puntuación de fórmulas es distancia de edición de cadenas, no equivalencia visual ni CDM. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de un adaptador sobre un modelo de 0,8B en BF16, la huella es reducida, pero no se publica una cifra concreta.
- GPU recomendadas: no se especifican modelos concretos; el quickstart requiere una build de PyTorch con CUDA y soporte BF16, además de un `torchvision` compatible.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; por el tamaño del modelo base (0,8B) es plausible, pero el autor no lo documenta.
- Opciones de despliegue: el script de referencia usa `transformers==5.3.0`, `peft==0.19.1`, `accelerate`, `safetensors` y `Pillow`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- El script de ejemplo no ejecuta el HTML generado.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables ni de especificaciones de modelos alternativos en la información proporcionada. La comparación directa más relevante es interna, entre el modelo base sin adaptador (B0) y con adaptador (S1), cuyos resultados figuran en la sección de benchmarks. No se han publicado comparaciones con otros adaptadores OCR ni con modelos OCR especializados en la información disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| qwen3.5-0.8b-document-ocr-lora | No disponible (LoRA r=4 sobre base de 0,8B) | No disponible | Apache-2.0 | Hugging Face |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Páginas con diseños mixtos, bloques pequeños, tablas y fórmulas pueden omitirse parcialmente aunque la decodificación termine con normalidad.
- La salida puede repetirse, truncarse o no preservar la estructura.
- El lanzamiento no establece cobertura multilingüe, orden de lectura multipágina ni parsing de documentos largos.
- Es imprescindible verificar la salida contra la imagen antes de confiar en ella.
- La concordancia con las transcripciones del profesor no equivale a precisión OCR verificada por humanos.
- La puntuación de fórmulas es distancia de edición de cadenas, no equivalencia visual ni CDM.
- La evaluación se basa en conjuntos pequeños (31, 12, 5 y 5 páginas), por lo que los resultados tienen alta varianza y no son puntuaciones de leaderboard.
- El adaptador no es un checkpoint fusionado ni un modelo autónomo: requiere el commit fijado del modelo base Qwen3.5-0.8B.
- No es un lanzamiento oficial de Qwen ni de Ai2.
- La licencia Apache-2.0 cubre el adaptador; el modelo base y los datasets conservan sus propios términos.
- El repositorio no redistribuye imágenes de páginas, documentos fuente ni transcripciones, y el contenido original de las páginas puede tener derechos separados.
- No se documentan sesgos conocidos ni tasas de alucinación específicas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yanpeng051821/qwen3.5-0.8b-document-ocr-lora
- Modelo base (commit fijado): https://huggingface.co/Qwen/Qwen3.5-0.8B/tree/2fc06364715b967f1860aea9cf38778875588b17
- Dataset Ai2 olmOCR-mix-1025: https://huggingface.co/datasets/allenai/olmOCR-mix-1025
- Dataset DBlake-BoxedLogic/Image-2-Markdown: https://huggingface.co/datasets/DBlake-BoxedLogic/Image-2-Markdown
- Dataset OmniDocBench: https://huggingface.co/datasets/opendatalab/OmniDocBench
- Registro de código, configuración y evaluación: https://github.com/yanpeng051821/AI_research/blob/cfe4a7c5548ede29b3d154aef09000c2d00e8327/training_engineering/case_studies/small-model-document-ocr/README.md
