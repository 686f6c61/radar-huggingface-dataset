# Techguardai/Inkling-2-Mini-TG-MLX

## Resumen

Inkling-2-Mini-TG-MLX es una cuantización mixta en MLX de Inkling 2 Mini, el modelo multimodal de 26.400 millones de parámetros desarrollado por Thinking Machines Lab. La variante la publica Tech Guard (TechGuardCoders) y está diseñada específicamente para ejecutarse en un Mac mini base con 16 GB de memoria unificada, manteniendo una ventana de contexto de 96.000 tokens y conservando la torre de visión para entrada de imágenes.

El modelo base es un mixture of experts con mecanismo de bucle (looped MoE) y pipeline image-text-to-text: acepta imágenes y texto y genera respuestas conversacionales. Esta versión cuantizada reduce los pesos de texto a 11,2 GB mediante una asignación de precisión por tensor basada en la sensibilidad medida (divergencia KL frente al modelo completo), en lugar de aplicar una receta uniforme a todas las capas.

Su relevancia es práctica: demuestra que un MoE de 26B con visión puede ejecutarse en hardware Apple Silicon de gama base con pérdida de calidad controlada (94,2 % de acuerdo top-1 con el modelo original, perplejidad un 4,5 % superior). Es el modelo por defecto del motor local Nuemac y requiere el layout de runtime de oMLX, no el de mlx-lm.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con bucle (looped mixture of experts); 128 expertos enrutados por capa, 8 activos; torre de visión ViT de 23 capas |
| Parametros totales | 26.388.641.280 (26,4B) |
| Parametros activos | no disponible |
| Longitud de contexto | 96.000 tokens (objetivo de diseño de la cuantización) |
| Tipos de cuantizacion | Mixta: expertos enrutados 3-bit affine (group 64), con gate/up a 2-bit en capas 1-6 y down a 2-bit en capas 0-6 y 12; proyecciones de atención 6-bit (8-bit en las más sensibles); embedding de tokens 4-bit; cabeza de salida 6-bit; normas y controladores de bucle sin cuantizar; torre de visión bf16 (ejecutable a 8 bits en Nuemac) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), layout de runtime de Inkling 2 de oMLX (`omlx.patches.inkling2`) |

## Arquitectura y entrenamiento

El modelo base, Inkling 2 Mini de Thinking Machines, es un transformer con mezcla de expertos y mecanismo de bucle: 128 expertos enrutados por capa con 8 activos, más controladores de bucle que reaplican bloques del modelo. Incorpora además una torre de visión de 23 capas (ViT) que procesa imágenes y las proyecta al espacio del modelo de lenguaje. Esta ficha no dispone de datos sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en el modelo original.

La innovación de esta variante es el método de cuantización. En lugar de aplicar una receta única, el cuantizador oQ de oMLX mide la sensibilidad de cada tensor como divergencia KL frente a las log-probabilidades top-20 del modelo completo y, con un presupuesto de tamaño fijo, asigna más bits a los tensores frágiles y menos a los robustos. El resultado son 11,2 GB de pesos de texto con un acuerdo top-1 del 94,2 % y KL de 0,041, frente al 91,1 % y 0,099 de la build oQ2.5e de 10,9 GB. La torre de visión, el tokenizador y la plantilla de chat se mantienen intactos respecto al release original.

## Capacidades

- Generación de texto conversacional multi-turno con contexto largo (hasta 96K tokens).
- Entrada de imágenes (image-text-to-text): lectura de texto en facturas, identificación de colores, conteo de objetos y análisis de capturas de pantalla.
- Razonamiento y tareas de agente, según los conjuntos de evaluación empleados por el autor (chat, código, agente y extracción).
- Generación y reescritura de código, incluyendo reescritura de archivos completos (caso de "copy drafting" medido a 44,7 tok/s).
- Tareas de extracción de información estructurada.
- Servidor compatible con la API de OpenAI a través de Nuemac (model id `inkling-2-mini`).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking explícito, audio u otras modalidades: no disponible.

## Casos de uso

- Asistente local en Mac de 16 GB: el modelo cabe en memoria unificada con contexto de 96K, lo que permite mantener conversaciones largas y documentos extensos sin salir del equipo ni enviar datos a la nube.
- Procesamiento de facturas y documentos escaneados: la torre de visión lee texto en imágenes (el autor reporta 6/6 en pruebas de factura, colores, conteo y captura de pantalla), adecuado para extracción de campos en flujos contables locales.
- Reescritura y refactorización de código en el editor: con 44,7 tok/s en reescritura de un archivo de 240 líneas, es viable para tareas de edición asistida sobre archivos completos en un Mac mini base.
- Agentes locales con contexto largo: la prueba de 94K tokens con recuperación de un hecho plantado (encontrado correctamente) lo hace apto para agentes que deben razonar sobre repositorios o documentación extensa.
- Servicio de inferencia compatible con OpenAI en red local: Nuemac expone `127.0.0.1:8080` con API compatible, lo que permite conectar herramientas existentes (clientes OpenAI, frameworks de agentes) sin adaptadores.
- Atención al cliente o FAQ sobre base documental: la ventana de 96K permite inyectar manuales completos y mantener historial de conversación; el rendimiento de 37 tok/s agregados con 4 peticiones simultáneas soporta varios usuarios ligeros.
- Prototipado y evaluación de modelos multimodales en Apple Silicon: sirve como banco de pruebas para medir calidad frente al modelo completo con las métricas de acuerdo top-1 y KL publicadas.

## Benchmarks y rendimiento

Calidad frente al modelo completo (20 prompts, 10.490 tokens de respuesta; KL en WikiText-2 sobre 40 × 512 tokens):

| Build | Pesos de texto | Acuerdo top-1 | KL | Perplejidad vs completo | WikiText KL |
|---|---|---|---|---|---|
| mlx-community oQ2.5e | 10,9 GB | 91,1 % | 0,099 | +10,7 % | 0,130 |
| **esta build** | **11,2 GB** | **94,2 %** | **0,041** | **+4,5 %** | **0,054** |
| mlx-community oQ3e | 12,3 GB | 94,4 % | 0,040 | +4,3 % | 0,036 |
| mlx-community oQ4e | 16 GB | 95,6 % | 0,024 | +2,6 % | 0,0045 |

Rendimiento en Mac mini M4 base de 16 GB (GPU de 10 núcleos), Nuemac 0.7.0:

| Métrica | Valor |
|---|---|
| Decodificación, una petición | 27,1 tok/s (prosa), 26,2 tok/s (código) |
| 4 peticiones simultáneas | 37,0 tok/s totales |
| Reescritura de archivo de 240 líneas | 44,7 tok/s |
| Prompt de 94K tokens | primer token a los 712 s, luego 15,1 tok/s; hecho plantado recuperado |
| Verificación de calidad (12 preguntas con respuesta conocida) | 12/12 |
| Pruebas de imagen (factura, colores, conteo, captura, seguimiento con caché) | 6/6 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada: 11,2 GB de pesos de texto; el objetivo de diseño es un Mac con 16 GB de memoria unificada, incluyendo contexto de 96K e imágenes.
- GPU recomendadas: Apple Silicon; el autor mide en un Mac mini M4 con GPU de 10 núcleos. No hay datos para A100, H100 ni RTX 4090, y el formato MLX no es portable a CUDA sin conversión.
- GPU de consumo: sí, en Apple Silicon de 16 GB o más. No está pensado para GPUs NVIDIA de consumo.
- Despliegue: Nuemac (motor del autor, con instalador vía Homebrew y servidor compatible con OpenAI) y oMLX 0.8.2 o superior. No es compatible con el layout de mlx-lm; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 27,1 tok/s en decodificación individual y 37,0 tok/s agregados con 4 peticiones en Mac mini M4 base; primer token a los 712 s para un prompt de 94K tokens (prefill limitado por ancho de banda de memoria).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Pesos de texto | Calidad vs completo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| **Inkling-2-Mini-TG-MLX** | 26,4B (MoE) | 96K | 11,2 GB | 94,2 % top-1, KL 0,041 | Apache-2.0 | Hugging Face, Nuemac, oMLX |
| mlx-community oQ2.5e | 26,4B (MoE) | no disponible | 10,9 GB | 91,1 % top-1, KL 0,099 | Apache-2.0 (heredada) | Hugging Face |
| mlx-community oQ3e | 26,4B (MoE) | no disponible | 12,3 GB | 94,4 % top-1, KL 0,040 | Apache-2.0 (heredada) | Hugging Face |
| mlx-community oQ4e | 26,4B (MoE) | no disponible | 16 GB | 95,6 % top-1, KL 0,024 | Apache-2.0 (heredada) | Hugging Face |

No se dispone de comparación con modelos de otros fabricantes o de otros formatos en la información proporcionada.

## Limitaciones y advertencias

- La cuantización introduce degradación medible: 5,8 % de desacuerdo top-1 con el modelo completo y perplejidad un 4,5 % superior; las tareas de razonamiento largo o matemáticas pueden amplificar ese error.
- El prefill es muy lento en hardware base: 712 s para un prompt de 94K tokens, lo que hace inviable el uso interactivo con contextos cercanos al máximo en un Mac mini M4.
- Compatibilidad restringida: requiere el layout de runtime de oMLX (`omlx.patches.inkling2`) y Nuemac u oMLX 0.8.2+; no carga en mlx-lm ni en stacks CUDA estándar.
- Idiomas soportados no documentados; no hay garantía de calidad fuera de los idiomas cubiertos por el modelo base, que tampoco se especifican.
- Riesgo de alucinación inherente a los modelos generativos; el autor solo reporta 12/12 en preguntas con respuesta conocida, una muestra pequeña.
- Sesgos: no hay evaluación de sesgos publicada en la información disponible.
- Licencia Apache-2.0 permite uso comercial, pero al ser una versión modificada conviene conservar los avisos de atribución a Thinking Machines Lab y verificar los términos del modelo base.
- La torre de visión se distribuye en bf16 sin cuantizar; Nuemac puede cargarla a 8 bits y solo cuando llega una imagen, pero otros runtimes pueden requerir memoria adicional.
- No hay datos de tool calling, agentes multi-paso ni modo thinking verificados de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Techguardai/Inkling-2-Mini-TG-MLX
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Repositorio de Nuemac: https://github.com/TechGuardCoders/nuemac
- Guía de instalación para agentes (AGENTS.md): https://github.com/TechGuardCoders/nuemac/blob/main/AGENTS.md
- oMLX: https://github.com/jundot/omlx
- MLX: https://github.com/ml-explore/mlx
- Tech Guard: https://github.com/TechGuardCoders
- Homebrew: https://brew.sh
