# Vontra/GLM-5.3-Flash-MLX-oQ4-MTP

## Resumen

GLM-5.3-Flash-MLX-oQ4-MTP es una conversión cuantizada del modelo multimodal zai-org/GLM-5.3-Flash, desarrollada por el usuario Vontra (bajo el sello TensorFold). Se trata de un MoE disperso multimodal de arquitectura `glm5_next` con 321.323.031.390 parámetros totales, adaptado al ecosistema MLX de Apple Silicon mediante una receta de cuantización mixta denominada oQ4: una base afín de 4 bits con 554 módulos sobrescritos a 5, 6 y 8 bits seleccionados por sensibilidad.

El interés principal de esta ficha reside en que preserva el bloque nativo de predicción del siguiente token (MTP, multi-token prediction) del checkpoint original, lo que habilita decodificación especulativa integrada en el propio modelo. El contexto configurado alcanza 1.048.576 tokens y el repositorio ocupa 185,749 GB, lo que lo sitúa en el terreno de despliegues en estaciones de trabajo con memoria unificada amplia.

La relevancia actual es doble: por un lado, demuestra que los MoE multimodales de gran escala pueden ejecutarse en hardware Apple Silicon mediante cuantización guiada por sensibilidad; por otro, la licencia MIT del checkpoint facilita su uso comercial, algo poco habitual en modelos de este tamaño. No obstante, la información pública disponible sobre el modelo base es limitada y muchos datos técnicos deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `glm5_next`, MoE disperso multimodal (vision-language), atención híbrida lineal y dispersa, hiperconexiones con restricción de variedad |
| Parametros totales | 321.323.031.390 |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens (configurado) |
| Tipos de cuantizacion | oQ4 mixta: base afín 4 bits con group size 64, 554 módulos sobrescritos a 5/6/8 bits; capa MTP con 12 sobrescrituras |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | MLX safetensors (35 shards, 3125 tensores, 59 de ellos MTP) |

## Arquitectura y entrenamiento

El modelo base emplea la arquitectura `glm5_next`, un transformer MoE disperso con capacidades multimodales (pipeline image-text-to-text). Incorpora atención híbrida que combina mecanismos lineales y dispersos, hiperconexiones con restricción de variedad y una capa embebida de predicción del siguiente token (MTP) que actúa como cabezal de borrador para decodificación especulativa. El checkpoint original se distribuye en FP8 E4M3 con escalado por bloques de 128x128.

Esta conversión concreta es una cuantización post-entrenamiento weight-only: no reentrena ni ajusta el modelo original. La receta oQ4 mide la sensibilidad de cada módulo mediante el error cuadrático medio relativo de activaciones, usando un proxy validado de 4 bits sobre un conjunto de calibración multilingüe de código (128 muestras de 256 tokens). La asignación de precisión sigue una regla de ranking de sensibilidad por capa con presupuesto de bytes bajo un objetivo oQ4 y un tope duro. Los expertos enrutados reciben base de 4 bits con proyecciones seleccionadas a mayor precisión; embeddings, cabeza de salida, codificador de visión y proyector se preservan a la precisión del origen. No se dispone de datos sobre el volumen de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto conversacional y razonamiento multi-turno con ventana de contexto de hasta 1.048.576 tokens.
- Procesamiento de imagen y texto (image-text-to-text): el codificador de visión y el proyector se conservan a precisión del origen.
- Capacidades de código, dadas las etiquetas del modelo y el conjunto de calibración basado en código; el alcance exacto no está documentado.
- Decodificación especulativa nativa mediante la capa MTP incluida, que permite generar borradores y verificarlos en el mismo modelo.
- Soporte multilingüe limitado a inglés y chino según los metadatos de idioma.
- Tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito, audio u otras modalidades: no disponible en la información proporcionada.

## Casos de uso

- Análisis de documentos extensos con imágenes intercaladas: la ventana de 1.048.576 tokens permite procesar informes, contratos o expedientes completos junto con sus figuras en una sola pasada, sin troceado ni pérdida de contexto entre secciones.
- Asistente de código en estación de trabajo Apple Silicon: un desarrollador puede cargar el modelo en un Mac Studio con memoria unificada amplia y usarlo para revisión de repositorios completos, dado el contexto disponible y la naturaleza del conjunto de calibración orientado a código.
- Procesamiento de documentación técnica bilingüe inglés-chino: equipos con documentación en ambos idiomas pueden usar el modelo para traducción, resumen y extracción de datos, dentro de los límites idiomáticos declarados.
- Prototipado de pipelines multimodales en local: investigadores pueden validar flujos image-text-to-text sin depender de APIs externas, aprovechando la licencia MIT y la ejecución sobre MLX.
- Evaluación de decodificación especulativa: la capa MTP incluida permite experimentar con generación asistida y medir su impacto en latencia sobre hardware Apple, comparando modos con y sin MTP.
- Extracción de información estructurada de capturas y formularios: el pipeline image-text-to-text admite tareas de lectura de documentos escaneados y conversión a texto o JSON, sujeto a validación empírica del rendimiento real.
- Despliegue comercial interno: la licencia MIT del checkpoint facilita integrar el modelo en productos propietarios, siempre que se verifiquen las obligaciones de atribución y el cumplimiento de la licencia del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor sí publica mediciones de decodificación en un Apple M3 Ultra con 256 GB de memoria unificada, runtime oMLX 0.6.3rc3 build 2475 y MLX 0.32.0:

| Modo | Tokens de salida | Decodificación mediana |
|---|---:|---:|
| oQ base, MTP desactivado | 128 | 6,2155 tokens/s |
| oQ con MTP nativo | 128 | 4,9969 tokens/s |

Estos datos indican que, en la configuración medida, activar el MTP nativo reduce el throughput de decodificación en lugar de mejorarlo. No se dispone de cifras de prefill, latencia de primer token ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM o memoria unificada: el repositorio pesa 185,749 GB, por lo que se requiere al menos esa cantidad de memoria disponible para cargar los pesos, más overhead de runtime, caché KV y activaciones. En la práctica, un equipo con 256 GB de memoria unificada es el mínimo realista observado en las pruebas del autor.
- GPU recomendadas: Apple Silicon con memoria unificada amplia; el autor valida en un Apple M3 Ultra con 256 GB. No hay datos de ejecución en A100, H100 ni RTX 4090, y el formato MLX no es compatible con CUDA sin conversión previa.
- GPU de consumo: no cabe en ninguna GPU de consumo actual (24 GB o menos) ni en configuraciones de 48-96 GB, dado el tamaño de los pesos.
- Opciones de despliegue: oMLX 0.6.3rc3 build 2475 (validado para oQ y MTP nativo), MLX 0.32.0 y MLX-VLM 0.6.3 con integración del runtime GLM5 Next. Builds antiguos sin soporte de oQ o de MTP de GLM5 Next no son compatibles. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 6,2155 tokens/s de decodificación mediana sin MTP y 4,9969 tokens/s con MTP en M3 Ultra, 256 GB. Sin datos de prefill ni de latencia de primer token.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones verificadas de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa se marca como no disponible. La siguiente tabla recoge únicamente los datos confirmados de este checkpoint frente a su modelo base:

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| GLM-5.3-Flash-MLX-oQ4-MTP | 321.323.031.390 | 1.048.576 | MLX safetensors oQ4 | MIT | Cuantizado, MTP nativo, solo Apple Silicon |
| zai-org/GLM-5.3-Flash | no disponible | no disponible | FP8 E4M3 con escalado 128x128 | MIT | Modelo base original, sin cuantizar |

Alternativas de la misma categoría (otros MoE multimodales de gran escala o conversiones MLX de modelos similares): no disponible en la información proporcionada.

## Limitaciones y advertencias

- Compatibilidad de runtime muy restrictiva: solo funciona con builds que entiendan la receta de cuantización por módulo y la integración MTP de GLM5 Next. Un runtime capaz de cargar una conversión MLX ordinaria no garantiza compatibilidad con este checkpoint.
- El MTP nativo empeoró el throughput en la medición del autor (de 6,2155 a 4,9969 tokens/s), por lo que su activación debe evaluarse empíricamente antes de usarlo en producción.
- Idiomas limitados a inglés y chino; no se declara soporte para castellano ni otros idiomas, lo que restringe su uso en entornos hispanohablantes sin evaluación adicional.
- Riesgo de alucinación: inherente a los modelos generativos; no se han publicado evaluaciones de fidelidad ni de tasas de alucinación para este checkpoint ni para el modelo base.
- Sesgos conocidos: no disponible en la información proporcionada.
- La cuantización es weight-only y no reentrena el modelo; las degradaciones de calidad respecto al checkpoint FP8 original no están cuantificadas en la información disponible.
- Licencia MIT declarada para el checkpoint, pero conviene verificar las condiciones del modelo base zai-org/GLM-5.3-Flash antes de un uso comercial, así como las licencias de las dependencias (MLX, MLX-VLM, oMLX).
- Requisito de memoria de aproximadamente 186 GB solo para pesos, lo que excluye prácticamente todo el hardware de consumo y limita el despliegue a estaciones de trabajo de gama alta.
- No hay datos publicados de benchmarks de calidad, lo que impide comparar su rendimiento con alternativas antes de adoptarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Vontra/GLM-5.3-Flash-MLX-oQ4-MTP
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Blog de Z.ai sobre GLM-5.3-Flash: https://z.ai/blog/glm-5.3-flash
- Informe técnico (arXiv): https://arxiv.org/abs/2602.15763
- Apple MLX (repositorio): https://github.com/ml-explore/mlx
- Licencia MIT del checkpoint: https://huggingface.co/Vontra/GLM-5.3-Flash-MLX-oQ4-MTP/blob/main/LICENSE
- TensorFold: https://tensorfold.dev
