# Suresh7479/Wan2.2-TI2V-5B

## Resumen

Wan2.2-TI2V-5B es un modelo de generacion de video por difusion desarrollado por el equipo Wan-AI (Alibaba), publicado dentro de la familia Wan2.2 como actualizacion de los modelos fundacionales Wan2.1. Este repositorio concreto, alojado por el usuario Suresh7479, es una copia del checkpoint oficial de 5.000 millones de parametros especializado en generacion conjunta de texto-a-video e imagen-a-video (TI2V) a resolucion 720P y 24 fotogramas por segundo.

El modelo resuelve el problema de generar video de alta definicion con coste computacional contenido: gracias a un VAE propio (Wan2.2-VAE) con ratio de compresion 16x16x4, el checkpoint de 5B puede ejecutarse en una unica GPU de consumo como la RTX 4090, algo inusual en modelos de video de esta resolucion. Se distribuye bajo licencia Apache 2.0 y soporta prompts en ingles y chino.

A diferencia de los modelos Wan2.2-T2V-A14B e I2V-A14B, que emplean una arquitectura de mezcla de expertos (MoE), la variante TI2V-5B es un modelo mas compacto orientado a eficiencia y despliegue en hardware asequible. Su relevancia actual radica en que combina soporte nativo en Diffusers y ComfyUI, lo que facilita su integracion en flujos de trabajo de generacion de video sin infraestructura de centro de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion para video (Wan2.2) con VAE de alta compresion (16x16x4) |
| Parametros totales | 5.000 millones (5B) |
| Parametros activos | No aplica (el modelo de 5B no es MoE; la arquitectura MoE corresponde a las variantes A14B) |
| Longitud de contexto | No disponible (modelo de generacion de video, no basado en contexto de texto) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo pertenece a la familia Wan2.2 y utiliza un transformer de difusion entrenado para eliminar ruido sobre latentes de video comprimidos. La innovacion principal de esta variante es el Wan2.2-VAE, que aplica una compresion espaciotemporal de 16x16x4, reduciendo drasticamente el coste de computo por fotograma y permitiendo generar 720P a 24 fps en tarjetas de consumo. El checkpoint TI2V-5B es una unica red densa de 5B parametros, en contraste con los modelos A14B de la misma familia, que introducen una arquitectura de mezcla de expertos (MoE) que separa el proceso de denoising por tramos temporales con expertos especializados para ampliar la capacidad sin aumentar el coste de inferencia.

En cuanto a los datos de entrenamiento, la model card indica que Wan2.2 se entreno con un volumen significativamente mayor que Wan2.1, con un 65,6% mas de imagenes y un 83,2% mas de videos, lo que mejora la generalizacion en movimiento, semantica y estetica. Tambien se menciona la incorporacion de datos esteticos curados con etiquetas detalladas de iluminacion, composicion, contraste y tono de color, lo que permite un control mas preciso del estilo cinematografico. No se detalla en la informacion disponible el numero exacto de tokens o fotogramas de entrenamiento, ni si se aplicaron tecnicas de RLHF o DPO (no aplicables tipicamente a modelos de difusion).

## Capacidades

- Generacion de video a partir de texto (text-to-video) a resolucion 720P y 24 fps.
- Generacion de video a partir de imagen (image-to-video), con animacion de una imagen inicial.
- Modelo unificado TI2V: cubre ambas tareas con un mismo checkpoint de 5B.
- Generacion de movimientos complejos y mayor generalizacion semantica respecto a Wan2.1.
- Control estetico cinematografico mediante etiquetas de iluminacion, composicion, contraste y tono de color.
- Soporte de prompts en ingles y chino.
- Integracion con Diffusers y ComfyUI para flujos de trabajo de generacion.
- Inferencia multi-GPU disponible para el modelo de 5B segun la documentacion de la familia.
- No se documenta soporte de tool calling, function calling ni capacidades de agente (no aplicables a un modelo de generacion de video).

## Casos de uso

- Generacion de clips publicitarios: el modelo produce video 720P a 24 fps directamente desde un prompt descriptivo con control de estilo cinematografico, lo que permite a equipos de marketing crear anuncios de producto sin rodaje.
- Animacion de imagenes de catalogo: mediante la funcion image-to-video, un e-commerce puede convertir fotografias estaticas de producto en pequenos clips animados para fichas de tienda o redes sociales.
- Prototipado rapido en produccion audiovisual: los estudios pueden generar storyboards animados o previsualizaciones (previsualizacion de planos) antes de rodar, ajustando iluminacion y composicion desde el propio prompt.
- Creacion de contenido para redes sociales: generacion de clips cortos en bucle en una unica GPU de consumo (RTX 4090), adecuado para creadores individuales o pequenos equipos sin infraestructura dedicada.
- Aumento de datos sinteticos para entrenamiento: los clips generados pueden usarse como datos sinteticos para entrenar otros modelos de vision por computador (deteccion de movimiento, seguimiento de objetos).
- Educacion y demostraciones tecnicas: generacion de animaciones explicativas a partir de diagramas o imagenes fijas, aprovechando la modalidad image-to-video.
- Desarrollo e investigacion en difusion de video: al estar bajo licencia Apache 2.0 y disponible en safetensors, sirve como base para fine-tuning y experimentacion academica en generacion de video eficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El modelo de 5B esta disenado para ejecutarse en una unica GPU de consumo; la model card cita explicitamente la RTX 4090 como hardware valido para 720P@24fps.
- El repositorio ocupa 34,2 GB en disco (incluye pesos en safetensors), por lo que se recomienda al menos ese espacio libre; el uso de VRAM en inferencia estara por debajo de ese tamano segun la precision y el modo de carga (dato exacto de VRAM no disponible en la informacion proporcionada).
- GPU recomendadas: la propia documentacion menciona consumer-grade como la RTX 4090; para despliegues de mayor volumen serian aplicables GPUs de centro de datos (A100, H100) aunque no se especifican cifras concretas.
- Opciones de despliegue: Diffusers, ComfyUI, y el codigo de inferencia propio del repositorio Wan2.2 (con soporte multi-GPU para el modelo de 5B). No se mencionan explícitamente vLLM, llama.cpp, Ollama ni TGI (no aplicables a modelos de difusion de video).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; la model card lo describe como uno de los modelos 720P@24fps mas rapidos disponibles, capaz de servir a sectores industriales y academicos.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Resolucion / fps | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Wan2.2-TI2V-5B | 5B | Transformer de difusion denso + VAE 16x16x4 | 720P a 24 fps | Text-to-video e image-to-video | Apache 2.0 | HuggingFace y ModelScope |
| Wan2.2-T2V-A14B | 14B (MoE) | MoE de difusion de video | 480P y 720P | Text-to-video | Apache 2.0 | HuggingFace y ModelScope |
| Wan2.2-I2V-A14B | 14B (MoE) | MoE de difusion de video | 480P y 720P | Image-to-video | Apache 2.0 | HuggingFace y ModelScope |
| Wan2.1 | No disponible | Difusion de video (familia anterior) | No disponible | Text-to-video e image-to-video | No disponible | HuggingFace y ModelScope |

Datos de rendimiento comparativo (benchmarks) no disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- No se documentan sesgos especificos en la informacion proporcionada; como modelo generativo entrenado con datos a gran escala, es probable que reproduzca sesgos presentes en sus datos de entrenamiento (no cuantificado).
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar contenido fisicamente incoherente, artefactos temporales o movimientos irreales, especialmente en escenas complejas.
- Limitacion idiomatica: los prompts soportados oficialmente son ingles y chino; el rendimiento con otros idiomas, como el castellano, no esta garantizado.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar que los datos o contenidos generados no infrinjan derechos de terceros y cumplir las politicas del proveedor.
- Este repositorio concreto (Suresh7479/Wan2.2-TI2V-5B) presenta 0 descargas y 0 likes en el momento de la consulta y no es el repositorio oficial; para produccion se recomienda usar el checkpoint oficial de Wan-AI para garantizar integridad y actualizaciones.
- El modelo esta pensado para generacion de video y no ofrece capacidades de razonamiento textual, tool calling ni agentes.
- Coste computacional elevado en generacion de video de alta resolucion; se recomienda validar VRAM y tiempo de inferencia en el hardware objetivo antes de desplegar.

## Enlaces

- Repositorio en HuggingFace (copia): https://huggingface.co/Suresh7479/Wan2.2-TI2V-5B
- Repositorio oficial: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Repositorio oficial T2V-A14B: https://huggingface.co/Wan-AI/Wan2.2-T2V-A14B
- Repositorio oficial I2V-A14B: https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B
- Organizacion Wan-AI en HuggingFace: https://huggingface.co/Wan-AI/
- GitHub del proyecto: https://github.com/Wan-Video/Wan2.2
- Informe tecnico (arXiv:2503.20314): https://arxiv.org/abs/2503.20314
- Sitio oficial: https://wan.video
- Blog: https://wan.video/welcome
- ModelScope (organizacion): https://modelscope.cn/organization/Wan-AI
- ModelScope (modelo TI2V-5B): https://modelscope.cn/models/Wan-AI/Wan2.2-TI2V-5B
- Discord: https://discord.gg/AKNgpMK4Yj
