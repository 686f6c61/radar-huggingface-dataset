# wanshanmu/LTX-2.3-spatial-upscaler-x2-v1.1-Diffusers

## Resumen

El modelo `wanshanmu/LTX-2.3-spatial-upscaler-x2-v1.1-Diffusers` es una conversión no oficial al formato Diffusers del upscaler espacial x2 (versión 1.1) del modelo de generación de vídeo LTX-2.3 de Lightricks. Se empaqueta como una pipeline `LTX2LatentUpsamplePipeline` que combina el VAE reutilizado de `diffusers/LTX-2.3-Diffusers` con los pesos del upsampler latente convertidos desde el checkpoint original `ltx-2.3-spatial-upscaler-x2-1.1.safetensors`. Su función es aumentar la resolución espacial de los latentes generados por LTX-2.3, permitiendo refinar vídeos generados a resoluciones más altas sin regenerar el contenido desde cero.

Este componente es relevante porque LTX-2.3, el modelo base, no incluye un upscaler en su pipeline estándar de Diffusers; esta conversión cubre ese vacío y facilita la integración en flujos de trabajo basados en la librería `diffusers`. La versión 1.1 mejora la v1.0, según fuentes externas, al corregir problemas de compatibilidad con resoluciones base y ofrecer un comportamiento más estable. El repositorio tiene un tamaño de 2,4 GB, lo que sugiere que incluye tanto el VAE como el upsampler, aunque no se especifican los parámetros exactos del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Upscaler latente espacial x2 (parte del ecosistema LTX-2.3) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica, es un upscaler de latentes) |
| Tipos de cuantizacion | no disponible (el repo usa safetensors, probablemente bf16) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | ltx-video-2-open-source-license |
| Formato de pesos | safetensors (Diffusers) |

## Arquitectura y entrenamiento

La arquitectura exacta del upscaler no se detalla en la información proporcionada. Se sabe que es un upscaler latente espacial x2, diseñado para duplicar la resolución de los latentes de vídeo producidos por el modelo base LTX-2.3. El VAE se reutiliza sin cambios desde `diffusers/LTX-2.3-Diffusers`, mientras que los pesos del upsampler se convirtieron desde el checkpoint v1.1 de Lightricks mediante el script `convert_ltx2_to_diffusers.py` de un checkout local de `diffusers` (versión 0.40.0.dev0). No hay información sobre el proceso de entrenamiento, datos utilizados o técnicas como RLHF/DPO, ya que se trata de una conversión de pesos, no de un entrenamiento nuevo.

## Capacidades

- Upscaling espacial x2 de latentes de vídeo generados por LTX-2.3.
- Integración con la pipeline `LTX2LatentUpsamplePipeline` de Diffusers.
- Compatible con flujos de refinamiento de vídeo: se puede usar después de `LTX2Pipeline` para aumentar la resolución sin regenerar el contenido.
- No es un modelo generativo autónomo; requiere latentes de entrada de un modelo LTX-2.3.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales más allá del procesamiento de latentes de vídeo.

## Casos de uso

- Refinamiento de vídeo generado con LTX-2.3: tras generar latentes con `LTX2Pipeline`, se pasan por este upscaler para obtener una resolución espacial doble, mejorando la nitidez sin volver a muestrear el modelo base.
- Integración en pipelines de Diffusers personalizados: al estar en formato Diffusers, se puede combinar con otros componentes (VAE, decodificador) en un flujo de generación de vídeo de alta resolución.
- Post-procesado en entornos de producción: permite escalar vídeos generados a resoluciones más altas para su distribución, manteniendo la coherencia temporal.
- Investigación en super-resolución de vídeo: sirve como referencia para estudiar upscalers latentes en el contexto de modelos de difusión.
- Desarrollo de flujos de trabajo en ComfyUI u otras herramientas que soporten Diffusers: se puede cargar como pipeline estándar y conectar a nodos de generación de vídeo.
- Evaluación comparativa de upscalers: al ser una versión mejorada (v1.1) frente a la v1.0, permite medir mejoras en calidad y estabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos numéricos sobre calidad de upscaling, velocidad o comparación con otros métodos.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamaño del repo (2,4 GB) sugiere que el modelo completo (VAE + upsampler) podría caber en GPUs con 8 GB de VRAM, pero no se confirma.
- GPU recomendadas: no disponible. Dado que es un upscaler pequeño, probablemente funcione en GPUs consumer como RTX 3060 o superiores, pero no hay especificación oficial.
- Opciones de despliegue: compatible con la librería `diffusers` (Python), por lo que se puede ejecutar en cualquier entorno con PyTorch y CUDA. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Resolución | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LTX-2.3-spatial-upscaler-x2-v1.1 (este) | Upscaler latente x2 | x2 | Diffusers (safetensors) | ltx-video-2-open-source-license | Hugging Face |
| LTX-2.3-spatial-upscaler-x2-v1.0 | Upscaler latente x2 | x2 | safetensors (bf16) | ltx-video-2-open-source-license | Hugging Face / Civitai |
| Lightricks/LTX-2.3 (modelo base) | Generación de vídeo | Variable | safetensors | ltx-video-2-open-source-license | Hugging Face |

La comparativa se limita a las versiones del mismo upscaler y al modelo base, ya que no se dispone de información sobre otros upscalers de vídeo comparables. La v1.1 es una mejora sobre la v1.0, según fuentes externas, pero no hay datos cuantitativos.

## Limitaciones y advertencias

- Conversión no oficial: el autor indica que es una conversión de staging, no un repositorio oficial de Diffusers. Puede haber diferencias sutiles con el checkpoint original.
- Dependencia del modelo base: requiere latentes generados por LTX-2.3; no funciona con otros modelos de vídeo.
- Sin garantías de producción: al ser una conversión comunitaria, no hay soporte oficial ni pruebas exhaustivas.
- Licencia restrictiva: la licencia `ltx-video-2-open-source-license` puede imponer restricciones de uso comercial; se debe revisar el texto completo en el enlace proporcionado.
- Sin información sobre sesgos o alucinaciones: al ser un upscaler, no genera contenido nuevo, pero puede amplificar artefactos presentes en los latentes de entrada.
- Tamaño del repo (2,4 GB) puede incluir el VAE, lo que aumenta el peso total; el upsampler en sí podría ser más ligero.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/wanshanmu/LTX-2.3-spatial-upscaler-x2-v1.1-Diffusers
- Repositorio similar (rootonchair): https://huggingface.co/rootonchair/LTX-2.3-spatial-upscaler-x2-v1.1-Diffusers
- Página de LTX-2.3 en ltxworkflow: https://ltxworkflow.com/models/ltx23-spatial-upscaler-x2-11
- Página de la v1.0 en Civitai: https://civitai.com/models/2780839/ltx-23-spatial-upscaler-x2
- Modelo base Lightricks/LTX-2.3: https://huggingface.co/Lightricks/LTX-2.3
- Licencia LTX Video 2 Open Source: https://huggingface.co/Lightricks/LTX-2.3/blob/main/LICENSE
