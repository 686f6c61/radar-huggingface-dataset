# Woovee/h3-prism-runpod

## Resumen

Woovee/h3-prism-runpod es un paquete de despliegue (serving package) de generación de vídeo que empaqueta la fusión "PRISM" del modelo MiniMax H3, creada por OliviaRossi, en un formato listo para servir en Runpod con ComfyUI. No es un modelo nuevo entrenado desde cero, sino un derivado comunitario no oficial que combina los checkpoints Singularity v2 y 10Eros-Max beta 6, cuantizado a INT8 y con checksums fijados para garantizar la integridad de los pesos.

El paquete resuelve un problema práctico: facilitar el despliegue de un modelo de vídeo de gran tamaño (39,5 GB el repositorio completo) con todos sus componentes (checkpoint de difusión, codificador de texto Qwen3-VL-32B, VAEs de vídeo y audio) ya configurados y verificados en un entorno concreto. Incluye seis flujos de trabajo de ComfyUI para texto a vídeo, imagen a vídeo y referencia a vídeo, con generación de audio estéreo integrada.

Su relevancia actual radica en la escena comunitaria de modelos de vídeo: las fusiones (merges) de modelos de difusión permiten combinar estilos y capacidades de varios checkpoints, y este paquete documenta con detalle un despliegue real verificado en GPU NVIDIA A40, algo poco habitual en derivados comunitarios. La licencia es la MiniMax H3 Community License, con restricciones territoriales significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión latente para vídeo (MiniMax H3), con codificador de texto Qwen3-VL-32B y VAEs de vídeo y audio separados |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (checkpoint de difusión), NVFP4 y AWQ (codificador de texto Qwen3-VL-32B), FP32 (VAE de audio) |
| Idiomas soportados | no disponible |
| Licencia | MiniMax H3 Community License Agreement (otra, con restricciones territoriales) |
| Formato de pesos | safetensors (checkpoint INT8 de 20,29 GB, sidecar prism_adaln_affine.safetensors, VAEs, LoRA opcional) |

## Arquitectura y entrenamiento

El modelo base es MiniMax H3, una arquitectura de difusión para generación de vídeo con soporte de audio sincronizado. El checkpoint PRISM es una fusión (merge) comunitaria de dos derivados: Singularity v2 (WarmBloodAban) y 10Eros-Max beta 6 (TenStrip), este último con material transferido de LTX 2.3, Wan 2.2 y Krea 2 según los términos de origen que el autor del 10Eros declara. El checkpoint resultante está podado con la técnica curve-rank-8, que reduce los pesos proyectados e incrusta una tabla de curvas que la revisión `7cebca5` de ComfyUI lee directamente mediante el nodo UNETLoader, sin necesidad de los tensores afines separados (que se conservan como sidecar por completitud).

No hay información publicada sobre datos de entrenamiento, número de tokens ni procesos de RLHF/DPO: se trata de una fusión de pesos existentes, no de un entrenamiento nuevo. El codificador de texto es Qwen3-VL-32B en cuantización NVFP4/AWQ, lo que sugiere comprensión conjunta de texto e imágenes para el condicionamiento. El paquete incluye además un VAE de vídeo en INT8 y un VAE de audio en FP32, así como un LoRA opcional "H3 Realism People" desactivado por defecto.

## Capacidades

- Generación de vídeo desde texto (text-to-video) con audio estéreo sincronizado.
- Generación de vídeo desde imagen (image-to-video), con configuración por defecto de 768 × 448 píxeles y 124 fotogramas a 24 FPS.
- Generación de vídeo por referencia (reference-to-video).
- Pipeline clasificado como image-text-to-video: condicionamiento mixto por texto e imagen mediante el codificador Qwen3-VL-32B.
- Generación de audio integrada mediante VAE de audio en FP32 (salida H.264 con AAC estéreo en las pruebas documentadas).
- Seis flujos de trabajo listos para ComfyUI.
- LoRA opcional de realismo para personas ("H3 Realism People"), desactivado por defecto.
- Muestreo flexible: 1 a 12 pasos (8 por defecto), CFG 1, muestreador res_multistep/simple, shifts de vídeo/audio 10/3.

No hay información sobre tool calling, agentes ni capacidades multilingües explícitas.

## Casos de uso

- Generación de vídeo por lotes en la nube: el paquete está diseñado como worker de Runpod, por lo que permite levantar un servicio de generación de vídeo bajo demanda sin configurar manualmente pesos, VAEs y codificadores.
- Animación de imágenes fijas: el flujo image-to-video por defecto (768 × 448, 124 fotogramas, 24 FPS) permite convertir ilustraciones o fotografías en clips animados con audio.
- Creación de contenido audiovisual estilizado: al ser una fusión de Singularity v2 y 10Eros-Max, el checkpoint combina las estéticas de ambos derivados, útil para vídeos con identidad visual concreta.
- Prototipado rápido de prompts de vídeo: con solo 8 pasos de muestreo y CFG 1, la inferencia es más ligera que en modelos de muchas etapas, adecuado para iterar prompts.
- Experimentación con LoRA: el LoRA "H3 Realism People" (probado a intensidad 0,3) permite ajustar el realismo de personajes sin reentrenar nada.
- Reproducibilidad en producción: el manifiesto `source-manifest.json` con checksums permite auditar que los pesos desplegados coinciden byte a byte con los originales, útil en entornos con requisitos de trazabilidad.
- Investigación sobre poda de modelos: el pruning curve-rank-8 y el sidecar de tensores afines ofrecen un caso de estudio real de compresión de checkpoints de difusión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo documenta pruebas funcionales (no comparativas): decodificación correcta de 39 fotogramas H.264 a 512 × 288 a 24 FPS con audio AAC estéreo en una NVIDIA A40, y validación de los seis flujos de trabajo en esa misma GPU.

## Requisitos de hardware

- VRAM: no se publica un mínimo oficial, pero la única GPU verificada es la NVIDIA A40 (48 GB), donde los seis flujos de trabajo se completaron con éxito. No hay confirmación de que funcione en GPUs con menos VRAM.
- GPU recomendada: NVIDIA A40 (verificada). GPUs de 48 GB o más (A6000, L40S, A100) son las candidatas razonables; no hay datos para RTX 4090 ni tarjetas de consumo.
- No está establecido que funcione en GPUs de consumo; el checkpoint INT8 de 20,29 GB más el codificador de texto Qwen3-VL-32B cuantizado y los VAEs sugieren que se necesita VRAM de gama profesional.
- Despliegue: ComfyUI (revisión `7cebca52227c63b4180ceed448cbd7ad22903b6d` fijada) sobre PyTorch CUDA 13, con nodos core de MiniMax H3 y nodos personalizados desactivados; el paquete está orientado a workers de Runpod. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Solo se sabe que las generaciones de prueba se completaron con éxito en A40.

## Comparativa con modelos similares

| Modelo | Tipo | Cuantizacion | Audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Woovee/h3-prism-runpod | Paquete de serving de fusión MiniMax H3 | INT8 (difusión), NVFP4/AWQ (text encoder) | Sí (VAE FP32) | MiniMax H3 Community (excluye UE, Reino Unido, Corea del Sur y EE. UU. del grant estándar) | Público en Hugging Face, 306 descargas |
| WarmBloodAban/Minimax-h3_Singularity | Fusión base (v2) de MiniMax H3 | no disponible | no disponible | MiniMax H3 Community | Público en Hugging Face |
| TenStrip/10Eros-Max | Fusión base (beta 6) de MiniMax H3 | no disponible | no disponible | MiniMax H3 Community + términos de LTX 2.3, Wan 2.2 y Krea 2 | Público en Hugging Face |
| OliviaRossi/Minimax-h3_Singularity-x-10Eros-Max_PRISM | Fusión PRISM original (base de este paquete) | no disponible | no disponible | MiniMax H3 Community | Público en Hugging Face |

Datos de rendimiento comparativos: no disponibles.

## Limitaciones y advertencias

- Restricciones territoriales graves de licencia: la MiniMax H3 Community License excluye de su grant estándar a la Unión Europea, Reino Unido, Corea del Sur y Estados Unidos. Desarrolladores e investigadores en España deben revisar con cuidado el archivo `LICENSE` antes de cualquier uso, incluido el comercial.
- El paquete no relicencia los pesos: siguen vigentes todos los términos upstream, incluidos los términos de origen declarados para material de LTX 2.3, Wan 2.2 y Krea 2 transferido al 10Eros-Max. Hay que conservar `NOTICE`, `LICENSE-QWEN.txt` y las model cards upstream al redistribuir.
- Es un derivado comunitario no oficial: no cuenta con el respaldo del autor de MiniMax H3 ni validación de calidad sistemática. La propia model card advierte que las pruebas limitadas no establecen mejoras de velocidad o calidad frente a otros modelos, ni la resolución o duración máximas utilizables.
- Riesgo de alucinación visual y artefactos: inherente a los modelos de difusión de vídeo y agravado por el pruning curve-rank-8 y la fusión de checkpoints, cuyos efectos sobre la calidad no se han medido.
- Sesgos: no documentados. Al derivar de fusiones con material de múltiples fuentes, el sesgo del modelo es difícil de trazar; precaución con generación de personas (el LoRA "Realism People" apunta precisamente a ese caso).
- Configuración de serving no validada para calidad: los parámetros (8 pasos, CFG 1, shifts 10/3) son decisiones de despliegue del autor, no valores recomendados tras una evaluación de calidad.
- Dependencia de una revisión concreta de ComfyUI y de PyTorch CUDA 13: versiones distintas pueden no soportar la tabla de curvas incrustada del checkpoint podado.
- Idiomas, contexto y parámetros: no disponibles en la documentación.

## Enlaces

- Modelo: https://huggingface.co/Woovee/h3-prism-runpod
- Modelo base (fusión PRISM): https://huggingface.co/OliviaRossi/Minimax-h3_Singularity-x-10Eros-Max_PRISM
- Fusión Singularity v2: https://huggingface.co/WarmBloodAban/Minimax-h3_Singularity
- Fusión 10Eros-Max: https://huggingface.co/TenStrip/10Eros-Max

No se han encontrado enlaces adicionales (papers, demos o repositorios) en la información disponible.
