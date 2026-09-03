# sprited/ardy-web-onnx

## Resumen

El modelo `sprited/ardy-web-onnx` es una exportación al formato ONNX del modelo ARDY (Autoregressive Diffusion with Hybrid Representation for Interactive Human Motion Generation) desarrollado por NVIDIA, adaptado para su ejecución en navegadores mediante ONNX Runtime Web y WebGPU. El autor, `sprited`, ha convertido el grafo completo de una ventana autoregresiva del modelo original —incluyendo decodificador, forward kinematics y 10 pasos de denoising con classifier-free guidance— en un único archivo `window.onnx` de 813 MB en precisión fp32. Esto permite generar movimiento humano a partir de texto directamente en el cliente, sin necesidad de servidor.

La relevancia de este modelo radica en que democratiza el acceso a la generación de movimiento interactivo de alta calidad en entornos web, un campo tradicionalmente reservado a GPUs de servidor. Al ser una exportación fiel del modelo ARDY de NVIDIA (reproduce `autoregressive_step` bit-for-bit para el caso solo texto), ofrece una alternativa viable para prototipado, educación y aplicaciones de animación en el navegador. El repositorio incluye además los archivos auxiliares necesarios para el renderizado: skeleton, skin y embeddings de texto precalculados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoregressive diffusion model (ARDY) exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de generacion de movimiento, no texto) |
| Tipos de cuantizacion | fp32 (unico formato indicado) |
| Idiomas soportados | no disponible (el text encoder original no se incluye; se usan embeddings precalculados de LLM2Vec) |
| Licencia | NVIDIA Open Model License (nvidia-open-model-agreement) |
| Formato de pesos | ONNX (archivo `window.onnx`) |

## Arquitectura y entrenamiento

El modelo es una exportación del grafo `WebWindow` de ARDY, que reproduce la ventana autoregresiva del modelo original: recibe 4 frames de historia y genera 40 frames a 20 fps, con 10 pasos de denoising y classifier-free guidance. El grafo ONNX incluye el decodificador, la forward kinematics y la generación de features de movimiento normalizadas, posiciones de joints (27 joints) y rotaciones (matrices 3x3). El text encoder original de 8B parámetros no se incluye en la exportación; en su lugar se proporcionan 20 embeddings de texto precalculados mediante el encoder LLM2Vec, almacenados en `prompts.{json,bin}`.

No se dispone de información sobre el entrenamiento del modelo base (datos, número de tokens, técnicas de alineación como RLHF o DPO). La exportación fue realizada con `web/export_web_onnx.py` del repositorio del autor, y se verifica que onnxruntime coincide con PyTorch en las features de movimiento con un error máximo de 3e-4.

## Capacidades

- Generacion de movimiento humano a partir de texto (text-to-motion) en el navegador.
- Ejecucion local en cliente via ONNX Runtime Web y WebGPU, sin servidor.
- Generacion autoregresiva con ventana de 4 frames de historia + 40 frames generados a 20 fps.
- 10 pasos de denoising con classifier-free guidance (pesos configurables para texto y restricciones).
- Salidas: features de movimiento normalizadas `[1,44,330]`, posiciones de joints `[1,44,27,3]` y rotaciones `[1,44,27,3,3]`.
- Incluye skinning (Core skin) para renderizado con linear blend skinning.
- No soporta tool calling, agentes, vision, audio ni otras modalidades.

## Casos de uso

- Demostracion web interactiva: el modelo permite mostrar generacion de movimiento en tiempo real en una pagina web, ideal para portafolios o galerias interactivas.
- Prototipado de animacion 3D: disenadores e investigadores pueden probar prompts de texto y ver resultados de movimiento sin instalar entornos de Python ni GPUs dedicadas.
- Educacion en animacion y motion generation: estudiantes pueden experimentar con un modelo de difusion autoregresiva directamente en el navegador, comprendiendo sus entradas y salidas.
- Herramientas de diseno web: integracion en editores de animacion online para generar poses o secuencias base que luego se refinan manualmente.
- Generacion de animaciones para videojuegos web: desarrollo de personajes o NPCs con movimientos generados proceduralmente a partir de descripciones textuales.
- Investigacion en interaccion humano-computadora: evaluacion de la calidad de movimientos generados en entornos de usuario final sin infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica verificacion indicada es que onnxruntime coincide con PyTorch en las features de movimiento con un error maximo de 3e-4, pero no se proporcionan metricas comparativas (MMLU, HumanEval, etc.) ni datos de latencia o throughput.

## Requisitos de hardware

- No se especifican requisitos minimos de hardware en la informacion proporcionada.
- El archivo `window.onnx` pesa 813 MB en fp32, por lo que se requiere suficiente memoria (VRAM o RAM compartida) para cargar el grafo en el navegador.
- Al estar disenado para WebGPU, se necesita un navegador compatible con WebGPU (Chrome, Edge, Firefox recientes) y una GPU con soporte WebGPU.
- No se indican GPUs concretas recomendadas ni opciones de despliegue alternativas (vLLM, llama.cpp, Ollama, TGI). El despliegue previsto es exclusivamente via ONNX Runtime Web en el navegador.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. No se puede establecer una comparativa con alternativas de la misma categoria (generacion de movimiento en navegador) sin datos adicionales.

## Limitaciones y advertencias

- El text encoder original de 8B parametros no se incluye; solo se proporcionan 20 embeddings precalculados, lo que limita la variedad de prompts de texto a los incluidos en `prompts.{json,bin}`.
- El modelo solo soporta el caso texto (text-only); no se contemplan otras modalidades como audio o video.
- La precision de la exportacion ONNX respecto a PyTorch es de 3e-4 en features de movimiento, lo que puede introducir pequenas diferencias en la salida final.
- La licencia NVIDIA Open Model License impone restricciones de uso comercial y redistribucion; es necesario revisar los terminos completos en el enlace proporcionado.
- No se dispone de informacion sobre sesgos, alucinaciones o limitaciones de contexto, al ser un modelo de generacion de movimiento y no de texto.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es un proyecto reciente o poco difundido; se recomienda verificar su estabilidad antes de usarlo en produccion.

## Enlaces

- HuggingFace: https://huggingface.co/sprited/ardy-web-onnx
- Repositorio del autor (sprited-ai/ardy): https://github.com/sprited-ai/ardy (branch `mps-support`, carpeta `web/`)
- Repositorio oficial de NVIDIA ARDY: https://github.com/nv-tlabs/ardy
- Proyecto de investigacion ARDY: https://research.nvidia.com/labs/sil/projects/ardy/
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-agreement
