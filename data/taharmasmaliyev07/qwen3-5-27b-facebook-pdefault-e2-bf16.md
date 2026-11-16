# taharmasmaliyev07/Qwen3.5-27B-FACEBOOK-PDEFAULT-E2-BF16

## Resumen

`taharmasmaliyev07/Qwen3.5-27B-FACEBOOK-PDEFAULT-E2-BF16` es un modelo multimodal de tipo image-text-to-text derivado de la familia Qwen3.5, con 27.781.427.952 parámetros totales y pesos en formato BF16 (safetensors). Lo publica el usuario taharmasmaliyev07 en Hugging Face bajo licencia Apache 2.0 y pipeline `image-text-to-text`, lo que indica que acepta tanto texto como imágenes como entrada y genera texto.

La model card es mínima: se limita a indicar que se trata de un fine-tuning del propio repositorio (el campo `base_model` apunta al mismo ID, lo que sugiere una cadena de derivación no documentada), que se entrenó con Unsloth y TRL, y que los idiomas declarados se reducen a inglés. No se especifican datos de entrenamiento, hiperparámetros, longitud de contexto ni resultados de evaluación.

Su relevancia es principalmente práctica para quien necesite un checkpoint de 27B multimodal afinado y con licencia permisiva, pero la ausencia de documentación técnica obliga a tratar cualquier uso en producción con cautela y a validar el comportamiento empíricamente antes de desplegarlo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `qwen3_5` en Hugging Face; arquitectura interna no documentada en la model card) |
| Parámetros totales | 27.781.427.952 (27,78B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en BF16; cuantizaciones posteriores no documentadas) |
| Idiomas soportados | en (inglés, según la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16), compatible con `transformers` |

## Arquitectura y entrenamiento

El repositorio declara la etiqueta `qwen3_5` y el pipeline `image-text-to-text`, por lo que se trata de un transformer multimodal de la familia Qwen3.5, con 27,78B parámetros en precisión BF16 y un tamaño de repositorio de 56,1 GB, coherente con ese número de parámetros. No se detalla en la información disponible la composición del vision encoder, la estrategia de atención, la longitud de contexto nativa ni si emplea mezcla de expertos.

Respecto al entrenamiento, la model card solo indica que el fine-tuning se realizó con Unsloth y la librería TRL de Hugging Face, con una mejora declarada de velocidad de 2x. No se especifican el número de tokens de entrenamiento, la composición del dataset, si hubo RLHF, DPO o SFT, ni la naturaleza del ajuste (posiblemente LoRA/QLoRA dado el uso de Unsloth, aunque no se confirma). El campo `base_model` apunta al mismo identificador del repositorio, lo que impide reconstruir la cadena de derivación a partir de los metadatos.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta `conversational` y el pipeline declarado.
- Procesamiento de entradas imagen-texto (pipeline `image-text-to-text`), lo que habilita tareas de descripción de imágenes, VQA y razonamiento sobre contenido visual.
- Compatibilidad con `text-generation-inference` (TGI) y `transformers`, lo que facilita su despliegue en infraestructura estándar.
- No se documentan capacidades de tool calling, function calling, agentes, modo thinking ni audio en la información disponible.
- Capacidades multilingües limitadas al inglés según la model card; no se confirma soporte de otros idiomas.

## Casos de uso

- Descripción automática de imágenes en inglés: el pipeline `image-text-to-text` permite generar alt-text o pies de foto para catálogos y CMS, aunque la calidad debe validarse empíricamente al no haber benchmarks publicados.
- Respuesta visual a preguntas (VQA) en inglés: útil para asistentes de soporte que reciben capturas de pantalla o fotos de producto y necesitan extraer información estructurada.
- Prototipado rápido de asistentes conversacionales multimodales: al estar en formato `transformers` y ser compatible con TGI, se puede levantar un endpoint en pocas horas para pruebas internas.
- Extracción de información de documentos escaneados en inglés: combinando entrada de imagen y generación de texto se pueden obtener resúmenes o campos clave, siempre con validación humana por el riesgo de alucinación.
- Fine-tuning posterior sobre dominios específicos: al estar bajo Apache 2.0 y con pesos en BF16, sirve como punto de partida para ajustes con Unsloth/TRL en tareas verticales.
- Investigación en adaptación multimodal: útil como checkpoint de referencia para estudiar cómo se comporta un modelo de 27B afinado sobre una base Qwen3.5 en tareas imagen-texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 56 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 80 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: aproximadamente 28-30 GB, viable en una A100 40 GB o en dos RTX 4090.
- VRAM estimada en cuantización de 4 bits: en torno a 14-16 GB, potencialmente desplegable en una RTX 4090 de 24 GB, aunque la cuantización no está documentada por el autor.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para BF16 sin compromisos; A100 40 GB o 2x RTX 4090 para 8 bits; RTX 4090 única para 4 bits con contexto reducido.
- Opciones de despliegue: `transformers`, `text-generation-inference` (TGI), y previsiblemente `vLLM` y `llama.cpp`/`Ollama` tras conversión a GGUF, aunque esta última no está confirmada en la información disponible.
- Latencia y throughput: no disponibles; dependen fuertemente de la GPU y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|
| taharmasmaliyev07/Qwen3.5-27B-FACEBOOK-PDEFAULT-E2-BF16 | 27,78B | no disponible | Apache 2.0 | Sí (image-text-to-text) | Hugging Face, 0 descargas |
| Qwen2.5-VL-32B-Instruct (referencia de familia, no verificada aquí) | ~32B | no disponible en esta ficha | Apache 2.0 (según versión) | Sí | Hugging Face |
| Gemma 3 27B (referencia de tamaño similar, no verificada aquí) | ~27B | no disponible en esta ficha | Términos de Google | Sí (versión IT multimodal) | Hugging Face |

La comparación con alternativas concretas no puede completarse con rigor porque la información proporcionada no incluye datos de benchmarks ni especificaciones detalladas de los modelos de referencia; las filas de Qwen2.5-VL-32B y Gemma 3 27B se incluyen solo como categorías de tamaño comparable y deben verificarse en sus respectivas fichas.

## Limitaciones y advertencias

- Documentación mínima: la model card no describe datos de entrenamiento, hiperparámetros ni evaluación, lo que impide auditar sesgos o comportamientos.
- Riesgo de alucinación no cuantificado: al no haber benchmarks ni evaluaciones publicadas, no se puede estimar la fiabilidad en tareas de razonamiento o extracción de información.
- Idiomas: declarado únicamente en inglés; el uso en castellano no está soportado oficialmente y puede degradar la calidad.
- Longitud de contexto desconocida: no se puede planificar el despliegue para documentos largos o conversaciones multi-turno extensas sin medirla empíricamente.
- Cadena de derivación ambigua: el campo `base_model` apunta al propio repositorio, lo que dificulta rastrear el origen real del checkpoint y verificar su procedencia.
- Sin tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por terceros.
- Licencia Apache 2.0 permisiva para uso comercial, pero la responsabilidad sobre el comportamiento del modelo recae íntegramente en quien lo despliega.
- Posible infraentrenamiento o sobreajuste al dataset de fine-tuning no documentado; se recomienda evaluación propia antes de producción.

## Enlaces

- Hugging Face: https://huggingface.co/taharmasmaliyev07/Qwen3.5-27B-FACEBOOK-PDEFAULT-E2-BF16
- Unsloth (herramienta de entrenamiento citada): https://github.com/unslothai/unsloth
- TRL de Hugging Face (librería citada): https://github.com/huggingface/trl
- Text Generation Inference (pipeline declarado): https://github.com/huggingface/text-generation-inference
