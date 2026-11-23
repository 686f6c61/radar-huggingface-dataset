# tencent/WeMM-Ecom-35B-A3B-GGUF

## Resumen

WeMM-Ecom-35B-A3B-GGUF es la edición cuantizada en formato GGUF del modelo multimodal WeMM-Ecom-35B-A3B, desarrollado por WeChat Vision (Tencent) para la comprensión de contenido en el contexto del comercio electrónico de WeChat. El modelo resuelve tareas de entendimiento imagen-texto orientadas a catálogo de producto: atributos, moderación, OCR, recuperación, grounding y razonamiento sobre fichas y creatividades comerciales, además de mantener capacidades generales de VQA, documentos, gráficos y razonamiento STEM.

La arquitectura es un transformer MoE (mixture of experts) con 34.660.610.688 parámetros totales y aproximadamente 3.000 millones de parámetros activos, según la model card. La ventana de contexto alcanza los 262.144 tokens, lo que permite procesar conversaciones multi-turno largas o lotes de imágenes con instrucciones extensas. El modelo base pertenece a la familia WeMM-Ecom, que incluye variantes de 0,8B, 2B, 4B, 9B y 35B-A3B.

Esta edición GGUF combina pesos del modelo de lenguaje en cuantización Q4_K_M con un proyector multimodal en F16, y está pensada para despliegue con llama.cpp, tanto en línea de comandos como en servidor local compatible con la API de OpenAI. Es relevante para equipos que necesitan inferir un modelo multimodal de 35B en hardware modesto sin renunciar a una ventana de contexto muy amplia, aunque el soporte de idiomas declarado se limita a chino e inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (image-text-to-text); tag `qwen3_5_moe` |
| Parámetros totales | 34.660.610.688 (~35B) |
| Parámetros activos | ~3B (MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | Q4_K_M (modelo de lenguaje) + F16 (proyector multimodal) |
| Idiomas soportados | zh, en |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); modelo base en BF16, FP8 y GPTQ disponibles por separado |
| Tamaño del repositorio | 22,1 GB |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer con mezcla de expertos (MoE), con unos 35B parámetros totales y aproximadamente 3B activos por token, lo que reduce el coste computacional de inferencia frente a un modelo denso del mismo tamaño. Incorpora un proyector multimodal que traduce representaciones visuales al espacio del modelo de lenguaje; en esta edición GGUF el proyector se distribuye en F16 (`mmproj-F16.gguf`) mientras que el modelo de lenguaje se cuantiza a Q4_K_M. La ventana de contexto es de 262.144 tokens.

La model card no detalla el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO. Sí se indica que el entrenamiento está orientado a comprender contenido de comercio electrónico de WeChat y que la evaluación cubre 28 benchmarks de e-commerce en ocho escenarios y 64 benchmarks generales en ocho categorías. El modelo soporta modo híbrido de pensamiento (*thinking*), con resultados de benchmark reportados por separado para modo instruct y modo thinking. La model card no especifica innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto e imagen-texto en modo conversacional multi-turno.
- Comprensión de imágenes de producto: atributos, categorías, moderación de contenido y OCR.
- Recuperación y grounding visual (localización de elementos en la imagen).
- Razonamiento sobre contenido comercial y conocimiento de producto.
- VQA general, comprensión de documentos y gráficos, razonamiento STEM y comprensión espacial.
- Comprensión multi-imagen y conteo.
- Seguimiento de instrucciones y tareas centradas en texto.
- Modo de pensamiento híbrido (instruct y thinking) para razonamiento multi-paso.
- Soporte de servidor local compatible con la API de OpenAI mediante `llama-server`.
- Idiomas: chino e inglés.
- No se documenta en la información disponible soporte explícito de tool calling o function calling.

## Casos de uso

- Catalogación automática de productos: el modelo puede recibir una imagen de producto y generar atributos estructurados (categoría, color, material, talla) aprovechando su entrenamiento específico en e-commerce y su contexto de 262.144 tokens para procesar lotes con instrucciones extensas.
- Moderación de creatividades comerciales: análisis de imágenes y texto de anuncios para detectar contenido no permitido, apoyándose en las tareas de moderación incluidas en el suite de evaluación del modelo.
- Extracción OCR de fichas y etiquetas: lectura de texto incrustado en imágenes de producto (etiquetas, ingredientes, precios) para poblar bases de datos de catálogo.
- Búsqueda visual y recuperación: generación de descripciones y representaciones de producto para sistemas de búsqueda o similitud dentro de un marketplace, usando las capacidades de retrieval y grounding reportadas.
- Asistente conversacional de atención al cliente: gestión de consultas multi-turno sobre productos con contexto largo, desplegado mediante `llama-server` con API compatible con OpenAI para integrarse en backends existentes.
- Análisis de documentos y gráficos comerciales: interpretación de informes, tablas de precios o dashboards en imagen, gracias a las capacidades generales de document y chart understanding.
- Despliegue en hardware de gama media: al usar cuantización Q4_K_M con ~3B parámetros activos, permite inferencia local en entornos con VRAM limitada frente a alternativas densas de 35B.

## Benchmarks y rendimiento

La model card reporta comparativas agregadas del checkpoint de la familia WeMM-Ecom-35B-A3B (escala 0-100), no de la versión GGUF específica:

| Comparación | Diferencia media reportada |
|---|---|
| E-commerce vs. Qwen3.5-35B-A3B | +3,92 puntos |
| E-commerce vs. Qwen3.6-35B-A3B | +3,36 puntos |
| E-commerce vs. MiniCPM-V-4.7-35B-A3B | +8,22 puntos |
| General vs. Qwen3.5-35B-A3B | +0,17 puntos |
| General vs. MiniCPM-V-4.7-35B-A3B | +5,60 puntos |
| General vs. Valley3-32B | +9,13 puntos |

Los resultados desglosados por benchmark se presentan en la model card como imágenes (`assets/ecommerce-benchmarks.png`, `assets/general-benchmarks.png`) y tablas en modo instruct y thinking; los valores numéricos individuales por benchmark no están disponibles en formato texto en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 22,1 GB; con Q4_K_M del modelo de lenguaje más el proyector F16, se necesita aproximadamente esa cifra de memoria, más overhead de contexto KV. Un contexto de 262.144 tokens incrementa sustancialmente el consumo de KV cache.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, una GPU de 24 GB (RTX 4090, A10G) puede alojar los pesos, pero el contexto completo requerirá mayor VRAM o GPU de datacenter (A100 40/80 GB, H100).
- GPU de consumo: es plausible en RTX 4090 (24 GB) con contexto reducido; no confirmado oficialmente en la información disponible.
- Despliegue: llama.cpp en la revisión probada `a8f8294c45076538f4509754e4c79fc51a1a486b`, con `llama-cli` y `llama-server` (API compatible con OpenAI); build CUDA o CPU.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| WeMM-Ecom-35B-A3B | ~35B totales / ~3B activos | 262.144 | Apache 2.0 | Multimodal e-commerce (zh/en) |
| Qwen3.5-35B-A3B | ~35B MoE (según comparativa de la model card) | no disponible | no disponible | Multimodal general |
| Qwen3.6-35B-A3B | ~35B MoE (según comparativa de la model card) | no disponible | no disponible | Multimodal general |
| MiniCPM-V-4.7-35B-A3B | ~35B MoE (según comparativa de la model card) | no disponible | no disponible | Multimodal general |
| Valley3-32B | 32B | no disponible | no disponible | Multimodal general |

Según la model card, WeMM-Ecom-35B-A3B supera a estas alternativas en la media de benchmarks de e-commerce y mantiene paridad o ventaja en benchmarks generales. Los datos de contexto y licencia de los modelos comparados no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Idiomas limitados a chino e inglés; el rendimiento en castellano no está garantizado ni evaluado.
- Riesgo de alucinación inherente a modelos generativos, especialmente en atributos de producto no visibles en la imagen.
- El enfoque de entrenamiento está sesgado hacia el e-commerce de WeChat; el rendimiento en dominios ajenos puede diferir del reportado.
- La cuantización Q4_K_M puede degradar ligeramente la precisión respecto al checkpoint BF16; no se han publicado métricas de la pérdida por cuantización.
- El contexto de 262.144 tokens exige una gestión cuidadosa de la KV cache en producción; no se documentan requisitos exactos de VRAM por longitud de contexto.
- No se documenta soporte de tool calling ni de agentes; verificar antes de diseñar pipelines que dependan de function calling.
- Licencia Apache 2.0 permite uso comercial, pero deben revisarse las condiciones del modelo base y de los datos de entrenamiento no detallados.
- La model card exige una revisión concreta de llama.cpp; versiones distintas pueden no cargar correctamente el proyector multimodal.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/tencent/WeMM-Ecom-35B-A3B-GGUF
- Modelo base BF16: https://huggingface.co/tencent/WeMM-Ecom-35B-A3B
- Variante FP8: https://huggingface.co/tencent/WeMM-Ecom-35B-A3B-FP8
- Variante GPTQ: https://huggingface.co/tencent/WeMM-Ecom-35B-A3B-GPTQ
- Colección WeMM-Ecom: https://huggingface.co/collections/tencent/wemm-ecom
- Repositorio GitHub: https://github.com/Tencent/WeMM-Ecom
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Licencia: https://huggingface.co/tencent/WeMM-Ecom-35B-A3B-GGUF/blob/main/LICENSE
- Tencent: https://www.tencent.com/
