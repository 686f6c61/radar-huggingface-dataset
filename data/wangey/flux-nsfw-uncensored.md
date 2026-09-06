# wangey/Flux-NSFW-uncensored

## Resumen

Flux-NSFW-uncensored es un adaptador LoRA desarrollado por wangey sobre el modelo de difusión de texto a imagen FLUX.1-dev de Black Forest Labs. Su propósito es reducir las restricciones de censura del modelo base, permitiendo explorar los límites técnicos de la generación de imágenes con IA. El repositorio tiene un tamaño de 0,7 GB y contiene los pesos del adaptador en formato safetensors, listos para cargarse sobre el modelo base mediante la librería PEFT.

Este modelo se presenta como un playground para probar los límites de la moderación de contenido en sistemas de generación de imágenes. Al estar basado en FLUX.1-dev, hereda la arquitectura de transformer de difusión de ese modelo, pero no se especifican los datos de entrenamiento, el número de parámetros del adaptador ni la longitud de contexto de texto soportada. La licencia es creativeml-openrail-m y el modelo está marcado como «not-for-all-audiences», lo que indica que su contenido puede no ser apto para todos los públicos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (FLUX.1-dev) con adaptador LoRA |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de texto a imagen; no se especifica la longitud de contexto de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors (lora.safetensors) |

## Arquitectura y entrenamiento

El modelo se basa en FLUX.1-dev, un modelo de difusión de texto a imagen de Black Forest Labs que utiliza una arquitectura de transformer. Sobre este modelo base se aplica un adaptador LoRA que modifica los pesos para minimizar las restricciones de censura. En la model card no se proporcionan detalles sobre el proceso de entrenamiento, la composición del dataset ni el número de tokens utilizados. Tampoco se menciona el uso de RLHF, DPO ni otras técnicas de alineación.

La única innovación destacable es el uso de LoRA como método de fine-tuning eficiente, que permite modificar el comportamiento del modelo base sin necesidad de reentrenar todos los parámetros. El código de ejemplo proporcionado utiliza la librería Diffusers de Hugging Face y carga el adaptador con `load_lora_weights`, empleando `torch.float16` para la inferencia.

## Capacidades

- Generación de imágenes a partir de prompts en inglés, con un nivel de censura reducido en comparación con el modelo base FLUX.1-dev.
- Permite probar prompts que normalmente serían bloqueados por sistemas de moderación de contenido.
- Soporta parámetros de generación como `guidance_scale`, `num_inference_steps`, `width` y `height`, tal como se muestra en el ejemplo de código.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No dispone de capacidades de visión, audio ni procesamiento de texto más allá de la interpretación del prompt.
- Capacidad especial: modo «uncensored» para contenido para adultos o explícito.

## Casos de uso

- Investigación sobre los límites de la censura en modelos de difusión: permite ejecutar prompts que el modelo base rechazaría, facilitando el estudio de los mecanismos de moderación.
- Creación de contenido artístico para adultos: generación de ilustraciones o fotografía artística con contenido explícito, donde el adaptador reduce las restricciones del modelo base.
- Pruebas de seguridad en sistemas de moderación: sirve como herramienta para evaluar la eficacia de filtros de contenido en pipelines de generación automática.
- Generación de imágenes para ficción adulta: novelas visuales, cómics o ilustraciones para proyectos editoriales que requieren contenido no censurado.
- Fine-tuning adicional: puede utilizarse como base para entrenar otros adaptadores o modelos derivados, gracias a su tamaño reducido de 0,7 GB.
- Prototipado de aplicaciones con requisitos de contenido no censurado: entornos de desarrollo donde se necesita probar la generación de imágenes sin restricciones de moderación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- No se especifica si cabe en GPU de consumo.
- Opciones de despliegue: el código de ejemplo utiliza Diffusers con PyTorch y requiere la librería PEFT para cargar el adaptador LoRA. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa detallada. El modelo es un adaptador LoRA sobre FLUX.1-dev, por lo que su comportamiento es similar al del modelo base con modificaciones en la moderación de contenido. Se ha identificado otro adaptador similar, `lustlyai/Flux_Lustly.ai_Uncensored_nsfw_v1`, pero no se han encontrado especificaciones técnicas públicas que permitan una comparación rigurosa.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| wangey/Flux-NSFW-uncensored | no disponible | no disponible | creativeml-openrail-m | Hugging Face |
| lustlyai/Flux_Lustly.ai_Uncensored_nsfw_v1 | no disponible | no disponible | no disponible | Hugging Face |

## Limitaciones y advertencias

- El modelo está marcado como «not-for-all-audiences» y está diseñado para generar contenido explícito o para adultos.
- No se han documentado sesgos específicos, pero al tratarse de un adaptador no censurado, es probable que amplifique los sesgos presentes en el modelo base.
- Riesgo de alucinación visual: la generación de imágenes puede producir contenido no deseado o incoherente, especialmente con prompts ambiguos.
- Limitaciones de idioma: solo se soporta inglés en la model card; no se garantiza un buen rendimiento con prompts en otros idiomas.
- Restricciones de licencia: la licencia creativeml-openrail-m permite uso comercial con condiciones, pero el contenido generado puede estar sujeto a restricciones legales según la jurisdicción.
- No se recomienda su uso en producción para aplicaciones con requisitos de moderación de contenido, debido a la naturaleza no censurada del modelo.
- El código de ejemplo menciona el repositorio `Heartsync/Flux-NSFW-uncensored`, mientras que el identificador real del modelo es `wangey/Flux-NSFW-uncensored`; es posible que exista un error en la documentación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wangey/Flux-NSFW-uncensored
- Colección de modelos FLUX NSFW y uncensored: https://huggingface.co/collections/anonymous111110987654321/ai-flux-nsfw-and-uncensored
- Modelo similar Lustly.ai Uncensored: https://huggingface.co/lustlyai/Flux_Lustly.ai_Uncensored_nsfw_v1
