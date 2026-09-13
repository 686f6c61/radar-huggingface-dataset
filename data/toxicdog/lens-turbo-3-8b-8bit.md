# toxicdog/Lens-Turbo-3.8B-8bit

## Resumen

Lens-Turbo-3.8B-8bit es una conversion a cuantizacion int8 del modelo de difusion texto-a-imagen microsoft/Lens-Turbo, publicada por el usuario toxicdog y empaquetada para Apple MLX. Se trata de la variante destilada a 4 pasos de la familia Lens de Microsoft: mantiene la misma arquitectura DiT (Diffusion Transformer) de 3.8B que el modelo base Lens, pero muestrea con num_inference_steps=4 y guidance_scale=1.0, lo que reduce drasticamente el coste de inferencia respecto a un muestreo estandar de decenas de pasos. El repositorio contiene unicamente los pesos del DiT en formato MLX safetensors, con 4.104.225.152 parametros y un tamano de 4.4 GB, cuantizados en int8 con group_size 64 (~4,39 GB segun la model card).

El interes de esta ficha es doble. Por un lado, es un ejemplo de port a MLX de un modelo de difusion moderno, pensado para ejecutarse en Apple Silicon con memoria unificada en lugar de en GPUs CUDA. Por otro, ilustra un patron de distribucion de pesos habitual en modelos compuestos: solo se re-hostean los pesos del DiT (licencia MIT), mientras que el encoder de texto GPT-OSS-20B (Apache-2.0) y el VAE de FLUX.2 se cargan desde el repositorio original de Microsoft, cada uno con sus propios terminos de licencia.

Conviene subrayar que no es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling ni flujos de agentes. Es un generador de imagenes de 1024x1024 condicionado por prompt textual, y su evaluacion debe hacerse con metricas de fidelidad prompt-imagen, no con benchmarks tipo MMLU o HumanEval. A fecha de la informacion disponible, el repositorio acumula 0 descargas y 0 likes, por lo que carece de validacion por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) con encoder de texto GPT-OSS-20B y VAE de FLUX.2 |
| Parametros totales | 4.104.225.152 (pesos safetensors del repositorio, correspondientes al DiT); la model card describe la arquitectura DiT como de 3.8B |
| Longitud de contexto | no disponible (modelo de difusion; la longitud maxima de prompt depende del tokenizador del encoder GPT-OSS-20B, no se especifica) |
| Tipos de cuantizacion | int8 con group_size 64 (esta variante); no se documentan otras cuantizaciones en la informacion disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT para los pesos del DiT; el encoder GPT-OSS-20B es Apache-2.0 y el VAE FLUX.2 se rige por sus propios terminos |
| Formato de pesos | safetensors en formato MLX (libreria mlx) |
| Tamano del repositorio | 4.4 GB |
| Pipeline | text-to-image |
| Modelo base | microsoft/Lens-Turbo |
| Resolucion de muestreo documentada | 1024 x 1024 |
| Pasos de inferencia recomendados | 4 (guidance_scale 1.0) |

## Arquitectura y entrenamiento

El modelo es un Diffusion Transformer (DiT) de 3.8B que actua como red de denoising sobre el espacio latente del VAE de FLUX.2. La condicion textual la aporta un encoder GPT-OSS-20B, que no forma parte de este repositorio y debe cargarse desde un snapshot de microsoft/Lens. La arquitectura es, segun la model card, byte-identical a la del modelo base Lens, y el port a MLX esta "parity-locked" contra la referencia en PyTorch con una similitud coseno de 0.999999 sobre las salidas del DiT. Esta variante concreta es la destilada de Lens-Turbo, que muestrea en 4 pasos con guidance fijo a 1.0 en lugar de requerir decenas de pasos con classifier-free guidance.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens o imagenes vistas, la composicion de los datos, ni sobre si se aplicaron etapas de RLHF, DPO o fine-tuning por preferencias. Tampoco se documenta la receta de destilacion (por ejemplo, si es destilacion por trayectoria, consistency distillation o un esquema adversarial). Lo unico verificable en la informacion proporcionada es la relacion de parentesco con microsoft/Lens y microsoft/Lens-Turbo, y que el artefacto publicado es una conversion de pesos, no un reentrenamiento.

En cuanto a la innovacion tecnica destacable, hay dos elementos: el uso de un encoder de texto de gran tamano (GPT-OSS-20B) para condicionamiento, poco habitual en modelos de difusion de este tamano, y el esquema de 4 pasos con guidance 1.0, que elimina la necesidad de duplicar el coste de forward por classifier-free guidance. La model card tambien advierte de una particularidad practica de MLX: conviene paginar los pesos a memoria (`mx.eval` sobre los parametros) antes del primer forward para evitar un timeout del watchdog de Metal al cargar desde almacenamiento lento.

## Capacidades

- Generacion de imagenes texto-a-imagen a partir de un prompt en lenguaje natural, con resolucion documentada de 1024x1024.
- Muestreo en 4 pasos de difusion con guidance_scale 1.0, lo que reduce el numero de evaluaciones del DiT frente a modelos no destilados.
- Control de reproducibilidad mediante semilla (seed) en la API de inferencia.
- Ejecucion nativa en Apple Silicon a traves de MLX, usando memoria unificada en lugar de VRAM dedicada.
- Compatibilidad con el pipeline LensPipeline del proyecto lens-mlx, que carga el tokenizador, el encoder GPT-OSS y el VAE de FLUX.2 desde un snapshot base.
- No soporta tool calling ni function calling: es un modelo de difusion, no un modelo de lenguaje con interfaz de herramientas.
- No soporta agentes ni razonamiento multi-paso en el sentido de los LLM; el unico "multi-paso" es el bucle de denoising.
- No hay modo thinking, vision de entrada, audio ni capacidades multimodales de entrada documentadas: la entrada es texto y la salida es imagen.
- Capacidades multilingues: no disponible (no se documenta que idiomas admite el encoder ni como afecta el idioma del prompt a la calidad).

## Casos de uso

- Prototipado rapido de conceptos visuales en local: con 4 pasos de inferencia y 1024x1024 de salida, un disenador puede iterar sobre variaciones de un concepto en un Mac con Apple Silicon sin depender de APIs externas ni de GPUs CUDA.
- Generacion de imagenes por lotes para aumentacion de datos: el modelo puede producir imagenes sinteticas etiquetadas por prompt para ampliar datasets de vision por computador, siempre que se revise la licencia de cada componente del pipeline antes de redistribuir el resultado.
- Herramientas de escritorio con privacidad estricta: al ejecutarse integramente en el equipo del usuario (MLX sobre Metal), los prompts no salen del dispositivo, lo que encaja en entornos con requisitos de confidencialidad sobre el material de referencia.
- Integracion en aplicaciones macOS o iOS mediante MLX: la API del pipeline expone una funcion simple (prompt, altura, anchura, pasos, guidance, semilla), lo que facilita embeberla en una app nativa o en un script de automatizacion.
- Maquetas y assets para desarrollo web o marketing: generacion de imagenes de fondo, ilustraciones de placeholder o variaciones de un mismo estilo para presentaciones internas y pruebas A/B de diseno.
- Investigacion sobre destilacion de modelos de difusion: al ser la variante de 4 pasos de una familia con hermano no destilado, sirve para estudiar la perdida de calidad inducida por la destilacion y por la cuantizacion int8 frente al modelo base.
- Evaluacion de ports MLX: util como caso de prueba para medir la fidelidad numerica de una conversion MLX frente a la referencia PyTorch, dado que la model card publica una metrica de paridad concreta (coseno 0.999999).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de FID, CLIP score, ImageReward, HPSv2 ni de adherencia a prompt para este modelo.

La unica metrica numerica publicada es una medida de paridad de implementacion, no de calidad de generacion:

| Metrica | Valor | Alcance |
|---|---|---|
| Similitud coseno del DiT frente a la referencia en PyTorch | 0.999999 | Fidelidad de la conversion a MLX, no calidad de imagen |
| Pasos de muestreo | 4 | Configuracion de inferencia recomendada |
| Guidance scale | 1.0 | Valor recomendado por el autor |
| Resolucion de ejemplo | 1024 x 1024 | Ejemplo de la model card |

## Requisitos de hardware

- Plataforma: Apple Silicon con MLX. No hay pesos GGUF, ONNX ni safetensors estandar de PyTorch publicados en este repositorio, por lo que no es directamente desplegable en CUDA con vLLM, TGI o diffusers sin reconvertir los pesos.
- Pesos del DiT: int8 con group_size 64, aproximadamente 4,39 GB de pesos, sobre un repositorio de 4,4 GB. Esa es la unica cifra de memoria documentada por el autor.
- Componentes adicionales obligatorios: el encoder de texto GPT-OSS-20B y el VAE de FLUX.2 deben cargarse aparte desde un snapshot de microsoft/Lens. La huella de memoria del encoder no se especifica en la informacion disponible; a titulo orientativo y como simple conversion aritmetica de su tamano, 20B parametros ocuparian del orden de 40 GB en bf16, unos 20 GB en 8 bits y unos 10-12 GB en 4 bits, segun la cuantizacion que se elija al cargarlo.
- Memoria unificada recomendada: no disponible como dato oficial. Como estimacion derivada de sumar el DiT int8 (~4,4 GB) mas el encoder en una cuantizacion baja y el VAE, un equipo con 32 GB de memoria unificada es el minimo razonable, y 64 GB o mas da margen para trabajar a 1024x1024 sin presion de memoria.
- GPU recomendadas: no aplica en el sentido tradicional; el destino es Apple Silicon (familias M-series). El autor no publica que chips concretos haya validado.
- Cabida en GPU de consumo: no disponible. El modelo no esta empaquetado para CUDA, y la ruta documentada pasa por Metal.
- Opciones de despliegue: el autor documenta exclusivamente el pipeline LensPipeline del proyecto lens-mlx (github.com/xocialize/lens-mlx). No se mencionan integraciones con diffusers, ComfyUI, Ollama, llama.cpp, vLLM ni TGI.
- Latencia y throughput: no disponibles. El autor no publica tiempos por imagen ni imagenes por segundo para ningun chip.
- Aviso de carga: la model card recomienda forzar la paginacion de pesos a memoria (`mx.eval` sobre los parametros) antes del primer forward cuando se carga desde almacenamiento lento o externo, para evitar un timeout del watchdog del command buffer de Metal en tamanos grandes.

## Comparativa con modelos similares

No se dispone de datos de rendimiento medidos que permitan comparar calidad de generacion. La comparativa se limita a caracteristicas verificables de la misma familia.

| Modelo | Parametros | Pasos de muestreo | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| toxicdog/Lens-Turbo-3.8B-8bit (este) | 4.104.225.152 en safetensors (DiT) | 4, guidance 1.0 | safetensors MLX, int8 group_size 64 | MIT (solo pesos del DiT) | 0 descargas, 0 likes |
| microsoft/Lens-Turbo | 3.8B DiT segun la model card | 4, guidance 1.0 | no disponible | no disponible en la informacion proporcionada | repositorio upstream del autor |
| microsoft/Lens | arquitectura DiT identica byte a byte a Lens-Turbo, segun la model card | no disponible (version no destilada) | no disponible | no disponible en la informacion proporcionada | repositorio upstream del autor |
| mlx-community/Lens-Turbo-3.8B-8bit | no disponible | 4, guidance 1.0 | safetensors MLX | no disponible | referenciado en el ejemplo de uso del autor |

No se documentan en la informacion proporcionada otros modelos comparables de la misma categoria (generacion texto-a-imagen en local sobre Apple Silicon) con datos verificables.

## Limitaciones y advertencias

- No es un modelo de lenguaje. No genera texto, no razona, no soporta tool calling ni agentes. Cualquier expectativa derivada de la ficha de un LLM es inaplicable aqui.
- Sesgos conocidos: no disponible. No se publica informacion sobre la procedencia del dataset de entrenamiento ni sobre sesgos demograficos, culturales o de representacion.
- Riesgo de alucinacion: en modelos de difusion el equivalente es la falta de adherencia al prompt y la generacion de contenido no solicitado. No se han publicado evaluaciones de adherencia ni de fidelidad al prompt.
- Filtros de seguridad: no se documenta ningun filtro, clasificador o lista de bloqueo de prompts. El modelo puede generar contenido inapropiado si el encoder y el pipeline no lo restringen.
- Idiomas: no disponible. No se especifica que idiomas maneja el encoder GPT-OSS-20B en este pipeline ni como penaliza un prompt en idiomas distintos del ingles. Todos los ejemplos de la model card estan en ingles.
- Discrepancia en el ejemplo de uso: el fragmento de codigo de la model card carga los pesos desde `mlx-community/Lens-Turbo-3.8B-8bit`, no desde `toxicdog/Lens-Turbo-3.8B-8bit`. Conviene verificar cual de los dos repositorios se esta descargando realmente y si los pesos son identicos.
- Discrepancia de recuento de parametros: el repositorio contiene 4.104.225.152 parametros en safetensors, mientras que el nombre y la model card hablan de "3.8B". Hay que asumir el dato de safetensors como el real para planificar memoria.
- Licencia mixta: la licencia MIT cubre unicamente los pesos del DiT. El encoder GPT-OSS-20B es Apache-2.0 y el VAE de FLUX.2 tiene sus propios terminos. Para uso comercial del pipeline completo hay que revisar los tres conjuntos de condiciones por separado, y ninguna de las partes no re-hosteadas se distribuye en este repositorio.
- Cuantizacion int8: la metrica de paridad publicada (coseno 0.999999) se refiere a la conversion de arquitectura frente a la referencia en PyTorch, no garantiza que la cuantizacion int8 con group_size 64 preserve la calidad de imagen del modelo en bf16. No hay evaluacion comparativa de calidad entre ambas precisiones.
- Madurez: repositorio creado y actualizado el 2026-09-13, con 0 descargas y 0 likes. No hay validacion independiente, ni issues resueltos, ni casos de uso reportados por terceros.
- Dependencia de un unico runtime: la unica via documentada de ejecucion es el proyecto lens-mlx. Si ese repositorio deja de mantenerse o cambia la API, el modelo queda sin ruta de inferencia publicada.
- Restriccion de plataforma para produccion: al ser pesos MLX, no se puede desplegar directamente en servidores con GPUs NVIDIA, lo que limita su uso a entornos Apple Silicon salvo que se reconviertan los pesos.

## Enlaces

- Repositorio del modelo: https://huggingface.co/toxicdog/Lens-Turbo-3.8B-8bit
- Modelo base: https://huggingface.co/microsoft/Lens-Turbo
- Repositorio alternativo citado en el ejemplo de uso: https://huggingface.co/mlx-community/Lens-Turbo-3.8B-8bit
- Implementacion del pipeline MLX: https://github.com/xocialize/lens-mlx
- Busqueda web realizada: no se han encontrado resultados relevantes. Los unicos resultados devueltos corresponden a paginas comerciales de Amazon (Amazon.de, Amazon Prime, Prime Video, Amazon Music) sin relacion alguna con el modelo, su arquitectura o su evaluacion. No se dispone por tanto de papers, blogs tecnicos ni demos adicionales que enlazar.
