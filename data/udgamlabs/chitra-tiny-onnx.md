# udgamlabs/Chitra-Tiny-ONNX

## Resumen

Chitra-Tiny-ONNX es la exportación a formato ONNX de Chitra-Tiny, un modelo de generación de imágenes texto-a-imagen de 212 millones de parámetros desarrollado por Udgam Labs y entrenado desde cero. El modelo genera imágenes de 256×256 píxeles y está diseñado específicamente para ejecutarse en el navegador mediante WebGPU y ONNX Runtime Web, lo que permite inferencia local en el dispositivo del usuario sin depender de servidores externos. Esta relevancia práctica lo sitúa en la categoría de modelos generativos ligeros orientados a privacidad y despliegue en el borde.

El repositorio no contiene únicamente el transformer de difusión, sino un pipeline completo dividido en cuatro archivos ONNX: el transformer principal (425 MB), un codificador de texto basado en google/flan-t5-base (220 MB), un decodificador VAE basado en stabilityai/sd-vae-ft-mse (99 MB) y un clasificador de seguridad NSFW basado en Falconsai/nsfw_image_detection cuantizado a 8 bits (87 MB). El tamaño total del repositorio es de 0,8 GB, lo que facilita su distribución y carga en entornos web.

La arquitectura emplea un diffusion transformer con rectified flow, un enfoque que difiere del UNet clásico de Stable Diffusion y que se alinea con la tendencia reciente hacia transformers de difusión. La licencia Apache-2.0 y el hecho de estar entrenado desde cero lo convierten en una alternativa interesante para desarrolladores que necesitan un modelo generativo de imagen con requisitos de hardware mínimos y capacidad de funcionar íntegramente en el cliente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion transformer con rectified flow |
| Parámetros totales | 212 M (transformer principal) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 77 tokens de texto (flan-t5-base) |
| Tipos de cuantización | Pesos en FP16 con cómputo en FP32; clasificador de seguridad en INT8 (cuantización dinámica) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 18) |
| Resolución de salida | 256×256 píxeles |
| Latentes | [B, 4, 32, 32] |
| Tamaño del repositorio | 0,8 GB |

## Arquitectura y entrenamiento

El modelo principal es un diffusion transformer de 212 millones de parámetros entrenado desde cero con rectified flow, una formulación de difusión que aprende una trayectoria recta entre ruido y datos, lo que permite un muestreo con pasos de Euler más estables y eficientes. El pipeline opera sobre latentes de 4 canales con resolución espacial de 32×32, que el VAE decodifica a imágenes de 256×256. El codificador de texto es el de google/flan-t5-base, que proyecta las secuencias de 77 tokens a un espacio de 768 dimensiones, y el decodificador VAE es el de stabilityai/sd-vae-ft-mse, con los latentes divididos por el factor 0,18215 antes de la decodificación.

La exportación se realizó con torch.onnx.export en opset 18. Los archivos del transformer, codificador de texto y VAE almacenan los pesos en 16 bits pero computan en 32 bits, ya que el cómputo en 16 bits desborda en el transformer. El clasificador de seguridad se cuantizó dinámicamente a 8 bits con ONNX Runtime. Las verificaciones realizadas el 28 de octubre de 2026 reportan un error relativo máximo del 0,09% frente a PyTorch en FP32 por archivo, latentes finales con diferencias inferiores al 0,15% y PSNR de 59,1 a 61,5 dB en el pipeline completo ejecutado en Chrome sobre WebGPU, con una diferencia máxima de 2 a 11 niveles por píxel sobre 255. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de imágenes texto-a-imagen a 256×256 píxeles a partir de prompts en inglés.
- Muestreo con rectified flow mediante pasos de Euler, con control de pasos y escala de guidance (por ejemplo, 50 pasos y guidance 7,0 en el ejemplo oficial).
- Soporte de prompt negativo para dirigir la generación.
- Codificación de texto con flan-t5-base, lo que aporta comprensión de instrucciones en inglés derivada de un modelo T5 ajustado.
- Clasificador de seguridad NSFW integrado en el repositorio para verificar las imágenes generadas antes de mostrarlas.
- Ejecución en navegador mediante WebGPU y ONNX Runtime Web, con todo el cómputo en el dispositivo.
- Ejecución en Python mediante ONNX Runtime con tokenizers y Pillow.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión de entrada, audio ni modo thinking.
- Capacidad multilingüe limitada al inglés; no se documentan otros idiomas.

## Casos de uso

- Generación de imágenes en el navegador con privacidad total: el pipeline completo se ejecuta en WebGPU sobre el dispositivo del usuario, de modo que los prompts y las imágenes nunca salen del cliente, lo que resulta adecuado para aplicaciones de creatividad personal o herramientas educativas.
- Prototipado rápido de interfaces de generación de imagen: al ocupar 0,8 GB y requerir únicamente ONNX Runtime Web, se puede integrar en demos web sin infraestructura de GPU en servidor, reduciendo costes operativos.
- Filtrado previo en pipelines de contenido: el clasificador NSFW incluido permite descartar imágenes no aptas antes de publicarlas, integrándose como paso de validación en flujos de generación automatizados.
- Aplicaciones offline o de borde: al no depender de conectividad ni de APIs externas, el modelo sirve para entornos con requisitos de soberanía de datos o conectividad intermitente.
- Investigación en modelos de difusión ligeros: con 212 M de parámetros y entrenamiento desde cero, es una base útil para estudiar rectified flow, arquitecturas diffusion transformer y técnicas de exportación ONNX en entornos con recursos limitados.
- Educación y demostraciones técnicas: el código público del visor (`/models/chitra-tiny/chitra.js`) y el ejemplo en Python facilitan explicar el funcionamiento interno de un pipeline texto-a-imagen paso a paso.
- Integración en plugins o extensiones de navegador: el tamaño reducido y la ejecución local permiten incorporar generación de imágenes a extensiones de Chrome o Edge con WebGPU disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos de rendimiento publicados son las verificaciones de fidelidad de la exportación:

| Verificación | Resultado |
|---|---|
| Error relativo por archivo frente a PyTorch FP32 (CPU) | ≤ 0,09% |
| Diferencia en latentes finales (pipeline WebGPU vs. PyTorch) | ≤ 0,15% |
| PSNR de imágenes finales (4 prompts, 50 pasos, guidance 7) | 59,1–61,5 dB |
| Diferencia máxima por píxel | 2–11 sobre 255 |
| Diferencia de probabilidades del clasificador de seguridad | ≤ 0,00002 |

No se dispone de datos de latencia ni de throughput medidos en hardware concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el repositorio completo ocupa 0,8 GB y los pesos se cargan en FP16 con cómputo en FP32, por lo que se estima un consumo moderado, aunque no se publican cifras exactas.
- GPU recomendadas: no se especifican modelos concretos; el requisito funcional es soporte de WebGPU (Chrome y Edge recientes en escritorio, Safari 26) para la ejecución en navegador.
- Compatibilidad con GPU de consumo: no se documenta explícitamente, pero el tamaño del modelo (212 M de parámetros) sugiere que puede ejecutarse en GPU integradas y dedicadas de gama media con WebGPU; no hay confirmación oficial.
- Opciones de despliegue: ONNX Runtime Web con backend WebGPU en navegador; ONNX Runtime en Python (CPU o GPU); el backend CPU del navegador funciona pero es mucho más lento según la model card.
- Latencia y throughput: no disponibles. La model card solo indica que sin WebGPU el rendimiento es considerablemente inferior.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución | Contexto de texto | Licencia | Ejecución en navegador |
|---|---|---|---|---|---|
| Chitra-Tiny-ONNX | 212 M | 256×256 | 77 tokens | Apache-2.0 | Sí (WebGPU) |
| Stable Diffusion 1.5 | ~860 M (UNet) | 512×512 | 77 tokens | CreativeML OpenRAIL-M | No de forma nativa |
| mrfakename/Chitra-Tiny-ONNX | 212 M | 256×256 | 77 tokens | Apache-2.0 | Sí (port comunitario previo) |

La comparación con Stable Diffusion 1.5 es aproximada, ya que este emplea una arquitectura UNet frente al diffusion transformer de Chitra-Tiny y cuenta con una licencia con restricciones de uso. El port de mrfakename es una alternativa comunitaria anterior al mismo modelo base. No se dispone de datos de benchmarks comparativos de calidad de imagen entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo entrenado desde cero y de pequeño tamaño (212 M de parámetros), por lo que la calidad y la fidelidad al prompt serán previsiblemente inferiores a las de modelos de mayor escala; no se publican métricas de calidad subjetiva.
- Resolución de salida limitada a 256×256 píxeles.
- Soporte exclusivo de inglés; los prompts en otros idiomas pueden degradar la calidad de forma no documentada.
- Ventana de texto de 77 tokens, suficiente para prompts cortos pero limitada para descripciones extensas.
- La model card advierte explícitamente de que se debe ejecutar el clasificador de seguridad antes de mostrar imágenes a otras personas; el clasificador solo se verificó numéricamente con imágenes normales, no se evaluó su capacidad de detectar contenido inseguro.
- La página de udgamlabs.com bloquea además una lista de palabras en los prompts, lo que indica riesgos de generación de contenido no deseado no cubiertos únicamente por el clasificador.
- El muestreo con números aleatorios distintos a los de PyTorch implica que una misma semilla produce imágenes diferentes entre el código ONNX y el código PyTorch original.
- Sin WebGPU, la ejecución en el backend CPU del navegador es mucho más lenta.
- Licencia Apache-2.0: permite uso comercial, pero el usuario debe verificar el cumplimiento de las licencias de los componentes de terceros (flan-t5-base Apache-2.0, sd-vae-ft-mse MIT, nsfw_image_detection Apache-2.0).
- Riesgo de alucinación visual y de sesgos en el dataset de entrenamiento no cuantificado en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/udgamlabs/Chitra-Tiny-ONNX
- Modelo base Chitra-Tiny: https://huggingface.co/udgamlabs/Chitra-Tiny
- Código del sampler original: https://huggingface.co/udgamlabs/Chitra-Tiny/blob/main/chitra_tiny.py
- Demo en navegador: https://udgamlabs.com/models/chitra-tiny#try
- Código del visor web: `/models/chitra-tiny/chitra.js` (referenciado en la model card)
- Codificador de texto flan-t5-base: https://huggingface.co/google/flan-t5-base
- Decodificador VAE sd-vae-ft-mse: https://huggingface.co/stabilityai/sd-vae-ft-mse
- Clasificador NSFW: https://huggingface.co/Falconsai/nsfw_image_detection
- Port comunitario previo: https://huggingface.co/mrfakename/Chitra-Tiny-ONNX
