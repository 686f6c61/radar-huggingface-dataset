# Xylolabs/CLIP-ViT-B-32-Text-Tenstorrent-Tensix-Components

## Resumen

CLIP ViT-B/32 Text Tenstorrent Tensix Components es un paquete de tensores de operador derivado del codificador de texto de OpenAI CLIP ViT-B/32, preparado por Xylolabs para su uso en aceleradores Tenstorrent Tensix. No se trata de un modelo entrenado de nuevo ni de un checkpoint completo: es una exportación de los pesos del text encoder ya convertidos a un formato de componentes listo para ser consumido por un runtime específico de hardware. El paquete contiene doce bloques transformer preparados, más tensores de embedding, posición, normalización, proyección y selectores de máscara.

El modelo base, CLIP ViT-B/32, es un transformer de visión-lenguaje de OpenAI que aprende representaciones conjuntas de imagen y texto mediante contraste. Esta exportación conserva únicamente la rama de texto: se excluyen el codificador visual y la escala de logits imagen-texto. Por tanto, el artefacto sirve para generar embeddings de texto alineados con el espacio semántico de CLIP, no para clasificación de imágenes directamente.

Su relevancia es de nicho pero concreta: facilita desplegar el text encoder de CLIP sobre hardware Tenstorrent sin necesidad de reconvertir pesos desde PyTorch, manteniendo los valores originales mediante un cast a FP32 y una representación de embedding en dos partes BF16. Está pensado para integraciones tipo OmniVLA-Edge y requiere aportar por separado el tokenizador, la implementación de la arquitectura y un adaptador de integración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (codificador de texto de CLIP ViT-B/32) |
| Parametros totales | no disponible (el paquete contiene 163 tensores preparados; no se declara el recuento de parámetros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | hasta 77 tokens CLIP, con padding a 96 posiciones |
| Tipos de cuantizacion | FP32 (160 entradas de bloque/posición/norm/proyección/máscara) y BF16 (embedding alto/bajo y selector de token final, 3 entradas); no se declaran cuantizaciones de 4/8 bits |
| Idiomas soportados | en |
| Licencia | MIT (modelo original OpenAI); el loader de Xylolabs usa Apache 2.0 |
| Formato de pesos | safetensors (13 archivos de tensores; 0,26 GB en disco, ~0,27 GB de memoria de dispositivo para pesos) |

## Arquitectura y entrenamiento

La arquitectura subyacente es el codificador de texto de CLIP ViT-B/32, un transformer estándar con doce bloques. Esta exportación no entrena ni afina el modelo: reproduce los pesos originales de OpenAI y los reorganiza en operandos de operador. Los 160 tensores de bloque, posición, normalización, proyección y máscara se almacenan en FP32, preservando los valores densos originales mediante el cast. El embedding se divide en dos partes BF16 (alta y baja) que se suman en FP32 en tiempo de ejecución, y se incluye un selector de token final de vocabulario más alto con máscaras 0/1 de atención permitida (no máscaras aditivas con -infinito).

La preparación incluye padding de las entradas de hasta 77 tokens CLIP a 96 posiciones y excluye explícitamente el codificador visual y la escala de logits imagen-texto. El puerto existente descrito por el autor usa productos densos en BF16 con residuales, normalización, puntuaciones de atención, softmax y pooling en FP32; los dtypes de archivo preservan esa frontera de preparación. No se documentan datos de entrenamiento, tokens vistos, RLHF ni DPO, porque no se ha reentrenado el modelo. Las verificaciones publicadas cubren preparación y serialización: los 149 tensores de texto originales coinciden exactamente con el artefacto JIT de OpenAI (SHA256 publicado), y los 163 tensores preparados coinciden con las fórmulas de conversión, embedding en dos partes, padding, máscara y selector, con todos los valores finitos.

## Capacidades

- Generación de embeddings de texto alineados con el espacio semántico de CLIP ViT-B/32.
- Codificación de hasta 77 tokens CLIP por entrada, con padding interno a 96 posiciones.
- Representación de embedding en dos partes BF16 combinadas en FP32 para preservar precisión.
- Soporte de atención con máscaras de atención permitida (indicadores 0/1).
- Integración en hardware Tenstorrent Tensix mediante operandos preparados.
- No incluye codificador visual ni escala de logits imagen-texto.
- No incluye tokenizador, implementación de arquitectura ni adaptador de integración; deben aportarse por separado.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un codificador de texto, no un modelo generativo.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Búsqueda semántica de texto sobre hardware Tenstorrent: el codificador genera embeddings de consultas y documentos en el mismo espacio que CLIP, permitiendo recuperación por similitud coseno sin depender de GPUs convencionales.
- Clasificación zero-shot de texto: usando los embeddings de etiquetas y la similitud con representaciones de referencia, se pueden construir clasificadores ligeros de tópicos o intenciones en pipelines de edge.
- Filtrado y deduplicación de contenidos: los embeddings permiten agrupar textos similares y detectar duplicados en grandes corpus, aprovechando el contexto de 77 tokens para fragmentos cortos.
- Moderación de texto en el borde: integrado en dispositivos con aceleradores Tensix, el codificador puede comparar mensajes contra un conjunto de embeddings de referencia de contenido sensible.
- Enriquecimiento de pipelines multimodales: al compartir espacio con CLIP, los embeddings de texto pueden alinearse con embeddings visuales generados por otros componentes del mismo ecosistema, habilitando búsqueda imagen-texto si se aporta la rama visual.
- Integración en sistemas tipo OmniVLA-Edge: el paquete está preparado para la integración OmniVLA, donde el codificador de texto alimenta instrucciones o descripciones en un pipeline de visión-lenguaje-acción.
- Prototipado de recuperación aumentada (RAG) en entornos con hardware Tenstorrent: indexación de fragmentos cortos de documentación y recuperación por similitud semántica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta verificaciones de preparación y serialización (coincidencia exacta con el artefacto JIT de OpenAI y con las fórmulas de conversión), y declara explícitamente que no se reporta velocidad.

## Requisitos de hardware

- Memoria de dispositivo: aproximadamente 0,27 GB para los pesos de componente, más espacio para búferes de trabajo.
- Almacenamiento: aproximadamente 0,26 GB en disco (repositorio de 0,3 GB).
- Hardware objetivo: aceleradores Tenstorrent Tensix; no se declaran requisitos para GPU convencionales.
- No se especifican modelos concretos de GPU (A100, H100, RTX 4090) ni si cabe en GPU de consumo, porque el paquete está orientado a Tensix.
- Despliegue: carga mediante `huggingface_hub` y el loader `load_components.py` incluido; requiere tokenizador CLIP original, implementación de la arquitectura de texto y adaptador de integración.
- Latencia y throughput: no disponibles; la model card indica que no se reporta velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rama | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Xylolabs CLIP-ViT-B-32 Text Tensix Components | no disponible | 77 tokens CLIP (padding a 96) | Solo texto | MIT (loader Apache 2.0) | safetensors (FP32/BF16) | Hugging Face, orientado a Tensix |
| openai/clip-vit-base-patch32 | no disponible en la informacion | 77 tokens | Texto y visión | MIT | PyTorch/safetensors | Hugging Face, uso general |
| Otros codificadores de texto CLIP (p. ej. variantes ViT-L/14) | no disponible en la informacion | 77 tokens | Texto y visión | MIT | PyTorch/safetensors | Hugging Face |

La comparación directa con alternativas de la misma categoría (codificadores de texto para embeddings) no está disponible en la información proporcionada. La diferencia principal frente al modelo base es que este paquete excluye la rama visual y está preformateado para Tensix.

## Limitaciones y advertencias

- No es un modelo completo: faltan tokenizador, arquitectura y adaptador; sin ellos no produce embeddings.
- Excluye el codificador visual y la escala de logits imagen-texto, por lo que no sirve para clasificación de imágenes por sí solo.
- Solo soporta inglés; no hay capacidades multilingües declaradas.
- Contexto limitado a 77 tokens CLIP, con padding a 96 posiciones; textos más largos deben truncarse o fragmentarse.
- No es un modelo generativo: no soporta tool calling, agentes ni razonamiento multi-paso.
- Riesgo de sesgos heredados del modelo original de OpenAI; no se documentan evaluaciones de sesgo en esta exportación.
- Riesgo de alucinación no aplica en el sentido generativo, pero los embeddings pueden reflejar asociaciones sesgadas del corpus de entrenamiento original.
- La licencia MIT del modelo original se mantiene, pero el loader de Xylolabs usa Apache 2.0; hay que respetar ambas. Se proporciona "as is", sin garantía.
- Las verificaciones publicadas cubren preparación y serialización, no la calidad de salida de un codificador integrado; se requiere validación propia.
- No se reportan métricas de rendimiento ni velocidad; el rendimiento real dependerá de la integración en Tensix.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/CLIP-ViT-B-32-Text-Tenstorrent-Tensix-Components
- Modelo base: https://huggingface.co/openai/clip-vit-base-patch32
- Repositorio original de OpenAI CLIP: https://github.com/openai/CLIP
- Integración OmniVLA: https://github.com/NHirose/OmniVLA
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Loader de componentes: https://huggingface.co/Xylolabs/CLIP-ViT-B-32-Text-Tenstorrent-Tensix-Components/blob/main/load_components.py
- Licencia: https://huggingface.co/Xylolabs/CLIP-ViT-B-32-Text-Tenstorrent-Tensix-Components/blob/main/LICENSE
