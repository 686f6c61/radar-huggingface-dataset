# uaxen-com/RealisticVision_V6_qnn2.28_min

## Resumen

RealisticVision_V6_qnn2.28_min es una conversión del modelo de difusión text-to-image Realistic_Vision_V6.0_B1_noVAE (de SG161222) a un formato optimizado para el runtime Qualcomm QNN versión 2.28, en su variante "min". El autor de la conversión es el usuario uaxen-com, que publica el resultado en Hugging Face como un repositorio de aproximadamente 1 GB. El modelo base es un checkpoint de Stable Diffusion 1.5 afinado para generar imágenes fotorrealistas, sin VAE incluido.

La relevancia de esta ficha es acotada: no se trata de un modelo nuevo ni de un fine-tune original, sino de un artefacto de despliegue orientado a ejecutar generación de imágenes en hardware Qualcomm (típicamente SoCs Snapdragon con aceleración NPU/Hexagon) mediante QNN. La conversión sigue una guía pública de conversión de modelos SD 1.5 a QNN 2.28 en modo mínimo.

No se dispone de información sobre licencia, idiomas, parámetros exactos ni resultados de benchmarks en la documentación disponible. La model card es mínima y se limita a indicar el modelo base y el enlace a la guía de conversión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Difusión latente (UNet + text encoder CLIP), derivada de Stable Diffusion 1.5; formato de ejecución QNN 2.28 |
| Parámetros totales | no disponible (el modelo base SD 1.5 ronda los 860 M en UNet; el total del pipeline no se especifica en la información) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen; el text encoder CLIP admite 77 tokens) |
| Tipos de cuantización | variante "min" de QNN 2.28; detalles de precisión (p. ej. int8/float16) no disponibles |
| Idiomas soportados | no disponibles (el prompt se procesa vía CLIP, predominantemente inglés) |
| Licencia | no disponible |
| Formato de pesos | artefactos QNN 2.28 (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo subyacente, Realistic_Vision_V6.0_B1_noVAE, es un checkpoint de Stable Diffusion 1.5 afinado por SG161222 para generar imágenes fotorrealistas. La arquitectura es la clásica de difusión latente: un UNet con bloques residuales y atención, un text encoder CLIP para condicionamiento textual y un decodificador VAE que en este caso se distribuye por separado (la variante "noVAE" excluye el VAE del checkpoint). El pipeline es text-to-image.

Esta publicación concreta no aporta información sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO), y tampoco documenta el proceso de conversión más allá de la referencia a una guía externa. La innovación técnica, si puede llamarse así, es el propio proceso de conversión a QNN 2.28 en modo "min", que empaqueta el grafo para su ejecución en el runtime de Qualcomm; no hay indicios de decodificación especulativa, atención lineal ni otras modificaciones arquitectónicas.

## Capacidades

- Generación de imágenes text-to-image con estética fotorrealista, heredada del fine-tune Realistic Vision V6.
- Condicionamiento mediante prompts de texto procesados por CLIP (hasta 77 tokens por prompt).
- Ejecución en hardware Qualcomm mediante el runtime QNN 2.28, orientada a despliegue en dispositivos con NPU Hexagon.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni modos de "thinking".
- No se documentan capacidades multimodales de entrada (imagen-a-imagen, inpainting, controlnet) en esta conversión.
- Capacidades multilingües: no disponibles; el text encoder CLIP está entrenado predominantemente en inglés.

## Casos de uso

- Generación de imágenes en dispositivos móviles con Snapdragon: el formato QNN 2.28 permite ejecutar el pipeline en la NPU del dispositivo, reduciendo el consumo energético frente a ejecución en CPU/GPU.
- Prototipado de apps de creación de imágenes offline: al no requerir conexión a un servidor, el modelo puede integrarse en aplicaciones Android que generen ilustraciones o avatares localmente.
- Pruebas de rendimiento en edge: útil para evaluar latencia y throughput de SD 1.5 convertido a QNN en distintos SoCs Qualcomm.
- Demos de investigación sobre cuantización y despliegue: sirve como artefacto de referencia para comparar la variante "min" frente a otras conversiones QNN.
- Generación de contenido visual para entornos con requisitos de privacidad: al ejecutarse en local, los prompts no salen del dispositivo.
- Evaluación de fidelidad de la conversión: permite comparar la calidad de imagen respecto al checkpoint original en FP16 para medir la degradación introducida por la conversión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio ocupa aproximadamente 1 GB, lo que sugiere pesos cuantizados y un pipeline sin VAE incluido.
- Hardware objetivo: SoCs Qualcomm con soporte QNN 2.28 (familias Snapdragon con NPU Hexagon); no está pensado para GPU NVIDIA ni para ejecución estándar en PyTorch.
- VRAM estimada: no disponible; en el hardware objetivo se emplea memoria unificada del SoC, no VRAM dedicada.
- No cabe esperar despliegue directo en vLLM, llama.cpp, Ollama ni TGI, ya que estos runtimes no soportan el formato QNN.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Formato | Hardware objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|
| RealisticVision_V6_qnn2.28_min | QNN 2.28 | Qualcomm (NPU Hexagon) | no disponible | Hugging Face (uaxen-com) |
| SG161222/Realistic_Vision_V6.0_B1_noVAE | safetensors (diffusers) | GPU NVIDIA/AMD, CPU | no disponible en la información | Hugging Face (SG161222) |
| Otras conversiones QNN de SD 1.5 | QNN | Qualcomm | variable | no disponible en la información |

La comparación directa con alternativas de la misma categoría (conversiones QNN de SD 1.5) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- La model card es mínima: no documenta licencia, precisión de cuantización ni limitaciones de uso, lo que dificulta evaluar su idoneidad para producción.
- Al derivar de un fine-tune fotorrealista de SD 1.5, hereda los sesgos del dataset de entrenamiento original y del checkpoint base, no documentados aquí.
- Riesgo de alucinación visual y de artefactos propios de la difusión latente, potencialmente amplificados por la conversión y cuantización a QNN.
- El prompt está limitado a 77 tokens por el text encoder CLIP y funciona principalmente en inglés.
- El VAE no está incluido en el checkpoint base ("noVAE"); es necesario disponer de un VAE compatible por separado para decodificar las latentes.
- Restricciones de licencia para uso comercial: no disponibles; debe verificarse la licencia del modelo base antes de cualquier uso comercial.
- El artefacto está atado al runtime QNN 2.28; cambios de versión del runtime o de SoC pueden romper la compatibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/uaxen-com/RealisticVision_V6_qnn2.28_min
- Modelo base: https://huggingface.co/SG161222/Realistic_Vision_V6.0_B1_noVAE
- Guía de conversión citada: https://ld-guide.chino.icu/conversion/sd15
