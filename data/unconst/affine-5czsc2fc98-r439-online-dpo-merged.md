# unconst/Affine-5czsc2fc98-r439-online-dpo-merged

## Resumen

El modelo `unconst/Affine-5czsc2fc98-r439-online-dpo-merged` es un checkpoint experimental creado por el usuario `unconst`, resultado de un merge de LoRA sobre el modelo base `kevin954/Affine-5dfqbbh8ev-sft`. Según los tags de HuggingFace, emplea una arquitectura `qwen3_5_moe` (mezcla de expertos basada en la familia Qwen 3.5) y es multimodal, con capacidades de procesamiento conjunto de imagen y texto (`image-text-to-text`). El repositorio contiene 35.107.181.936 parámetros (~35,1 mil millones) en formato safetensors, con un tamaño total de 70,2 GB.

La model card es extremadamente escueta: indica que es un "LoRA-merged" del modelo base citado, y añade el aviso "Private TTL insurance; not a submission until Stage-5 gate clears", lo que sugiere que se trata de un checkpoint intermedio de un proceso de desarrollo no publicado. No se proporciona información sobre licencia, idiomas, contexto, ni detalles de entrenamiento. Por tanto, esta ficha se basa únicamente en los metadatos disponibles y en las inferencias razonables a partir de los tags; cualquier dato no confirmado se marca explícitamente como no disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en Qwen 3.5 (según tag `qwen3_5_moe`), multimodal imagen-texto |
| Parametros totales | 35.107.181.936 (~35,1 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Los tags de HuggingFace indican que el modelo emplea una arquitectura de tipo `qwen3_5_moe`, es decir, una mezcla de expertos perteneciente a la familia Qwen 3.5, aunque no se especifica el número de expertos ni la estrategia de activación. También aparece el tag `image-text-to-text`, lo que implica que el modelo acepta entradas multimodales (imagen y texto) y genera texto, probablemente mediante un codificador visual integrado.

El checkpoint actual es el resultado de un merge de LoRA sobre el modelo `kevin954/Affine-5dfqbbh8ev-sft`, que a su vez figura como fine-tune de otro modelo (según el tag `base_model:finetune:kevin954/Affine-5dfqbbh8ev-sft`). El nombre del repositorio incluye `online-dpo-merged`, lo que sugiere que se aplicó un proceso de optimización por preferencias (DPO) en línea antes del merge, pero no hay documentación que lo confirme. No se dispone de datos sobre el dataset de entrenamiento, el número de tokens procesados, ni si se emplearon técnicas adicionales como RLHF o decodificación especulativa.

## Capacidades

- Generación de texto conversacional (tag `conversational`).
- Procesamiento multimodal de imagen y texto (tag `image-text-to-text`), lo que permite responder a consultas que combinan ambos tipos de entrada.
- Arquitectura MoE, que en principio ofrece una buena relación entre capacidad y coste computacional, aunque se desconoce el número de parámetros activos por inferencia.
- Compatible con `transformers` y con `endpoints_compatible`, lo que facilita su despliegue en entornos de inferencia estándar.
- No se ha confirmado soporte para tool calling, agentes, razonamiento multi-paso ni modos de pensamiento extendido.

## Casos de uso

Dado el carácter experimental y la falta de documentación, los casos de uso son especulativos y deben validarse antes de cualquier implementación:

- Chatbots multimodales: el modelo puede procesar imágenes y texto simultáneamente, lo que permitiría construir asistentes que respondan a consultas sobre fotografías, diagramas o capturas de pantalla.
- Análisis de documentos visuales: extracción de información de facturas, formularios o gráficos combinando visión y lenguaje natural.
- Generación de descripciones de imágenes: a partir de una entrada visual, el modelo podría producir texto descriptivo o narrativo.
- Asistentes de soporte técnico: integración en sistemas de atención al cliente que necesiten interpretar capturas de pantalla o imágenes de error.
- Prototipado rápido de aplicaciones de IA: al ser un checkpoint de tamaño medio (~35B), puede servir para experimentar con técnicas de fine-tuning o merge sin los costes de los modelos de mayor escala.
- Investigación sobre fusión de modelos: el propio checkpoint es un ejemplo de merge de LoRA sobre una base multimodal, útil para estudiar metodologías de combinación de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos sobre MMLU, HumanEval, GSM8K, ni comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada: con 35.107 millones de parámetros y un tamaño de repo de 70,2 GB, una inferencia en precisión FP16 requeriría aproximadamente 70 GB de VRAM. Con cuantización a 8 bits se reduciría a ~35 GB, y a 4 bits a ~18 GB, pero no se han publicado archivos cuantizados.
- GPU recomendadas: para FP16 serían necesarias GPUs de alta gama como A100 80GB, H100 80GB o múltiples RTX 4090 (24 GB cada una) en paralelo. Con cuantización 4 bits podría ejecutarse en una sola RTX 4090 o similar, siempre que se generen los archivos GGUF o AWQ correspondientes.
- Opciones de despliegue: al ser compatible con `transformers`, se puede servir con vLLM, TGI o HuggingFace Inference Endpoints. Para cuantización local, sería necesario convertir los pesos a GGUF para usar con llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. El modelo pertenece a una familia no documentada (Affine) y no se conocen sus parámetros activos, contexto ni rendimiento. Como referencia orientativa, modelos multimodales MoE de tamaño similar podrían ser Qwen2.5-VL-32B o Pixtral-12B, pero cualquier comparación sería especulativa sin datos de benchmarks.

| Modelo | Parametros | Contexto | Multimodal | Licencia |
|---|---|---|---|---|
| Affine-5czsc2fc98-r439 (este) | 35,1 B (total) | no disponible | Sí | no disponible |
| Qwen2.5-VL-32B | 32,5 B (total) | 128K | Sí | Apache 2.0 (partes) |
| Pixtral-12B | 12 B (total) | 128K | Sí | Apache 2.0 |

## Limitaciones y advertencias

- No hay documentación técnica: la model card no describe arquitectura, entrenamiento, ni capacidades verificadas.
- Licencia desconocida: no se puede garantizar el uso comercial ni la redistribución.
- Modelo experimental: el aviso "not a submission until Stage-5 gate clears" indica que es un checkpoint intermedio, posiblemente inestable o incompleto.
- Riesgo de alucinación: al no conocerse el proceso de entrenamiento ni los datos usados, el modelo puede generar contenido inexacto o inventado.
- Sesgos potenciales: sin información sobre el dataset, no se pueden evaluar sesgos de género, raza o idioma.
- Limitaciones de contexto e idioma: no se especifican, por lo que no se recomienda su uso en producción sin pruebas exhaustivas.
- Tamaño del repositorio: 70,2 GB, lo que implica requisitos de almacenamiento y ancho de banda considerables para descarga y despliegue.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/unconst/Affine-5czsc2fc98-r439-online-dpo-merged
- Modelo base (referenciado): https://huggingface.co/kevin954/Affine-5dfqbbh8ev-sft
- No se han encontrado papers, blogs, demos ni otros recursos adicionales.
