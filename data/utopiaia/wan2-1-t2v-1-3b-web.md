# UtopiaIA/Wan2.1-T2V-1.3B-web

## Resumen

Wan2.1-T2V-1.3B-web es una conversión a ONNX del modelo de generación de vídeo texto-a-vídeo Wan 2.1 T2V 1.3B, publicada por UtopiaIA para su ejecución en el navegador mediante ONNX Runtime Web sobre WebGPU. El modelo original lo desarrolla Wan-AI (Alibaba) y aquí se combina con los pesos de pocos pasos rCM de worstcoder/rcm-Wan para el transformer y con el decodificador ligero lighttaew2_1 de lightx2v, lo que reduce el muestreo a entre 2 y 4 pasos.

El objetivo del repositorio es llevar la generación de vídeo a un cliente web sin backend dedicado: el encoder de texto UMT5-XXL se cuantiza a 4 bits y el transformer a 8 bits (MatMulNBits) para que los pesos, 5,2 GB en total, puedan descargarse y ejecutarse en GPU del navegador. Es relevante porque demuestra la viabilidad de pipelines de difusión vídeo en WebGPU con cuantización agresiva, a costa de divergir del resultado exacto del modelo original para una misma semilla.

El repositorio contiene únicamente los pesos convertidos; el tokenizer se lee del repositorio original de Wan en una revisión concreta. No es un modelo entrenado desde cero, sino un artefacto de despliegue derivado de Wan-AI/Wan2.1-T2V-1.3B y worstcoder/rcm-Wan.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (DiT) para texto-a-vídeo, con encoder de texto UMT5-XXL y decodificador VAE ligero lighttaew2_1 |
| Parametros totales | 1,3 B (modelo base Wan2.1-T2V-1.3B); parámetros del encoder de texto y del decodificador no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Encoder de texto a 4 bits (MatMulNBits), transformer a 8 bits (MatMulNBits), embeddings UMT5 en bloques de 4 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`.onnx` con `.onnx_data`) más fichero `embed_q4.bin`; runtime onnxruntime-web |

## Arquitectura y entrenamiento

El modelo base Wan2.1-T2V-1.3B es un transformer de difusión para generación de vídeo condicionada por texto, pensado para ser compatible con casi cualquier GPU de consumo. Esta conversión mantiene esa arquitectura pero la divide en grafos ONNX ejecutables en WebGPU: el encoder de texto UMT5-XXL se reparte en cuatro shards (`t5/encoder_0…3.onnx`) con capas lineales en 4 bits, el transformer se separa en un grafo de prompt (`dit/ctx.onnx`) y tres bloques (`dit/part0…2.onnx`) con pesos de 8 bits, y el decodificador `vae/taew2_1_light.onnx` procesa un frame latente cada vez manteniendo sus memorias.

El muestreo sigue el script de inferencia de rCM / TurboDiffusion para Wan 2.1, con 2 a 4 pasos, gracias a los pesos de pocos pasos de worstcoder/rcm-Wan. No se documentan en la información disponible los datos de entrenamiento, el número de tokens ni si hubo RLHF o DPO; esos detalles corresponden al modelo original Wan-AI/Wan2.1-T2V-1.3B y a rcm-Wan, no a esta conversión. La innovación destacable es la combinación de destilación de pocos pasos (rCM), decodificador VAE ligero y cuantización mixta 4/8 bits para caber en el navegador.

## Capacidades

- Generación de vídeo a partir de prompts de texto (pipeline text-to-video).
- Muestreo en pocos pasos (2 a 4) gracias a los pesos rCM, frente a los muestreos largos de un modelo de difusión estándar.
- Decodificación de latentes frame a frame con el VAE ligero lighttaew2_1, reduciendo el coste de memoria del decodificador.
- Ejecución en cliente web mediante ONNX Runtime Web y WebGPU, sin servidor de inferencia.
- Cuantización mixta para reducir el tamaño de descarga y la huella de memoria en GPU.
- No se documentan soporte de tool calling, agentes, visión de entrada, audio ni modo de razonamiento.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Generación de vídeo en el navegador sin backend: el modelo se ejecuta con ONNX Runtime Web sobre WebGPU, de modo que una aplicación web puede producir clips a partir de prompts sin desplegar GPUs en servidor.
- Prototipado rápido de ideas creativas: con 2 a 4 pasos de muestreo, un equipo de diseño puede iterar prompts y semillas en local para explorar conceptos antes de pasar a un modelo mayor.
- Demos interactivas y herramientas educativas: útil para mostrar en una página web cómo funciona un pipeline de difusión texto-a-vídeo, incluyendo encoder de texto, transformer y VAE.
- Aplicaciones de privacidad por diseño: al ejecutarse en el cliente, los prompts y los vídeos generados no salen del dispositivo del usuario, lo que encaja en entornos con requisitos de confidencialidad.
- Generación de clips de baja resolución para previsualización: adecuado para storyboards o animáticas donde prima la disponibilidad inmediata sobre la fidelidad máxima.
- Integración en editores web o herramientas de creación de contenido: el formato ONNX y la separación en grafos permite cargar por partes los shards del encoder y del transformer según la memoria disponible.
- Experimentación con cuantización en WebGPU: sirve como referencia técnica para evaluar el equilibrio entre 4 y 8 bits en un pipeline de difusión completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Tamaño del repositorio: 5,2 GB, correspondiente a los pesos ONNX cuantizados; la descarga completa debe caber en el almacenamiento del cliente y, según el runtime, en memoria o en caché del navegador.
- VRAM estimada para inferencia: no disponible de forma explícita; la cuantización a 4 bits del encoder de texto y a 8 bits del transformer está pensada para reducirla, pero no se publican cifras.
- GPU recomendadas: no disponibles; el requisito funcional es una GPU con soporte de WebGPU en el navegador.
- Compatibilidad con GPU de consumo: el modelo base Wan2.1-T2V-1.3B se presenta como compatible con casi todas las GPU de consumo; la viabilidad concreta de esta conversión en cada GPU no está documentada.
- Opciones de despliegue: ONNX Runtime Web con backend WebGPU; no se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| UtopiaIA/Wan2.1-T2V-1.3B-web | 1,3 B (base) | no disponible | ONNX (4/8 bits) | Apache-2.0 | Conversión para navegador con WebGPU y muestreo rCM de 2 a 4 pasos |
| Wan-AI/Wan2.1-T2V-1.3B | 1,3 B | no disponible | no disponible en la información | Apache-2.0 (según el modelo base) | Modelo original texto-a-vídeo, compatible con casi todas las GPU de consumo |
| worstcoder/rcm-Wan | no disponible | no disponible | no disponible | no disponible | Pesos de pocos pasos rCM para el transformer de Wan 2.1 |

## Limitaciones y advertencias

- La cuantización a 4 bits del encoder de texto y a 8 bits del transformer hace que, para una misma semilla, el vídeo no coincida con el del modelo original, aunque siga el prompt.
- El repositorio solo contiene pesos convertidos; el tokenizer se lee del repositorio original de Wan en la revisión `37ec512624d61f7aa208f7ea8140a131f93afc9a`, por lo que la reproducibilidad depende de esa revisión externa.
- No se documentan sesgos conocidos, tasas de alucinación ni limitaciones de idioma; al ser un modelo texto-a-vídeo, el riesgo principal es la fidelidad del vídeo al prompt y la calidad visual, no la veracidad factual.
- Requiere un navegador y una GPU con WebGPU; no funcionará en entornos sin ese soporte.
- Licencia Apache-2.0, según los originales; conviene revisar el fichero NOTICE para atribuciones de fuentes y autores.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el 7 de noviembre de 2026; no hay evidencia de uso en producción.
- No se publican benchmarks ni cifras de latencia, por lo que no es posible garantizar rendimiento en producción sin medición propia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/UtopiaIA/Wan2.1-T2V-1.3B-web
- Modelo base: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
- Pesos rCM: https://huggingface.co/worstcoder/rcm-Wan
- Autoencoders lightx2v (lighttaew2_1): https://huggingface.co/lightx2v/Autoencoders
- ModelScope del modelo base: https://modelscope.ai/models/Wan-AI/Wan2.1-T2V-1.3B
- Sitio de Elffuss: https://elffuss.com/
