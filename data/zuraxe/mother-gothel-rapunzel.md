# zuraxe/mother-gothel-rapunzel

## Resumen

Mother Gothel - Rapunzel es un adaptador LoRA de personaje para generación de imágenes mediante difusión estable, desarrollado por NSFWstudio y distribuido a través de la plataforma Renderoverse. El repositorio de Hugging Face es un espejo que preserva los pesos de la versión 1.0.0 sin modificaciones. El modelo reproduce el personaje de Mother Gothel del universo Rapunzel, con un trigger word específico (`gothel_renderoverse`) y un token separado para el vestuario (`Gotheloutfit`).

Técnicamente se trata de un LoRA de bajo rango (185,7 MB, 185.719.296 bytes) pensado para aplicarse sobre checkpoints SDXL, en concreto la familia AnyIllustrious XL v011 según los metadatos embebidos. No es un modelo autónomo: requiere un checkpoint base compatible para funcionar. Su relevancia es acotada y de nicho, orientada a la generación de personajes consistentes en flujos de trabajo con ComfyUI u otras interfaces compatibles con LoRA de SDXL.

El repositorio está marcado como no apto para todas las audiencias, ya que los metadatos indican que el entrenamiento incluyó imágenes vestidas y desnudas del personaje. La licencia declarada es MIT, aunque esta no otorga derechos sobre personajes, nombres o marcas de terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre difusión latente SDXL |
| Parametros totales | no disponible (adaptador LoRA; rango y dimensiones no declarados) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo text-to-image) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/FP8 publicadas) |
| Idiomas soportados | no disponible (los prompts dependen del codificador de texto del checkpoint base) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador es un LoRA concebido para inyectarse en las capas de atención y proyección de un UNet SDXL. Los metadatos embebidos identifican el checkpoint base como AnyIllustrious XL v011 / SDXL, una variante de la familia Illustrious orientada a ilustración y estilización. El tamaño del archivo (185,7 MB) es coherente con un LoRA de rango moderado para SDXL, aunque el rango exacto, el alpha y las capas objetivo no se declaran en la información disponible.

No se especifican en la model card el número de imágenes de entrenamiento, la composición del dataset, la resolución de entrenamiento, el número de pasos ni si se aplicaron técnicas como regularización o captions detallados. Tampoco se documenta ningún proceso de refinamiento (RLHF, DPO u otros), algo esperable en un adaptador de personaje de este tipo. La única información técnica relevante es la identidad del archivo (SHA-256 `ca682fca67c033be52accc91b990c7f58dc8bbcb791673e031613329ca980c79`) y la indicación de que el dataset incluyó imágenes con y sin ropa.

## Capacidades

- Generación text-to-image de un personaje concreto (Mother Gothel) sobre checkpoints SDXL compatibles.
- Control de vestuario mediante el token secundario `Gotheloutfit`.
- Consistencia de personaje entre generaciones gracias al trigger word `gothel_renderoverse`.
- Compatibilidad con flujos ComfyUI mediante el nodo Load LoRA.
- Ajuste de intensidad del adaptador (strength) para modular el efecto sobre el estilo del checkpoint base.
- No soporta tool calling, agentes, razonamiento multi-paso ni procesamiento de audio o vídeo.
- No dispone de capacidades multilingües propias: la comprensión de prompts depende del codificador de texto del checkpoint base.

## Casos de uso

- Ilustración de personajes para proyectos creativos: aplicar el LoRA sobre AnyIllustrious XL v011 para generar variaciones coherentes del personaje en distintas poses y escenas, manteniendo la identidad visual entre imágenes.
- Previsualización de vestuario: usar `Gotheloutfit` junto con el trigger de personaje para explorar variantes de indumentaria en un pipeline de diseño conceptual.
- Integración en ComfyUI: cargar el archivo en `ComfyUI/models/loras` y encadenarlo con el checkpoint base para flujos de trabajo por nodos con control fino de sampler, CFG y steps.
- Prototipado de storyboards: generar secuencias de imágenes del personaje para guiones ilustrados o cómics, ajustando el strength del LoRA para armonizar con el estilo del checkpoint.
- Experimentación con mezclas de LoRA: combinar el adaptador con otros LoRA de estilo sobre la misma base SDXL para explorar resultados híbridos, siempre que la compatibilidad de tokens lo permita.
- Investigación sobre adaptadores de personaje: usar el archivo como caso de estudio para analizar cómo un LoRA de rango moderado condiciona la generación de un personaje concreto frente al checkpoint base sin adaptador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que este espejo no incluye evaluación de calidad de imagen ni métricas de rendimiento.

## Requisitos de hardware

- VRAM estimada: depende enteramente del checkpoint base SDXL. Un SDXL en FP16 requiere aproximadamente 8-10 GB de VRAM para inferencia; el LoRA añade una sobrecarga mínima (185,7 MB en disco).
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4090, A100 o H100 para el checkpoint base; el adaptador en sí no impone requisitos adicionales.
- Cabe en GPU de consumo: sí, siempre que el checkpoint base SDXL quepa en la VRAM disponible; con cuantización del base (por ejemplo, FP8) puede ejecutarse en GPUs de 8 GB.
- Opciones de despliegue: ComfyUI (soporte nativo de Load LoRA), Automatic1111/Forge, Diffusers con `load_lora_weights`, y otros frontends compatibles con LoRA de SDXL. No se documentan opciones para llama.cpp, Ollama, vLLM o TGI, que no aplican a modelos de difusión de imagen.
- Latencia y throughput: no disponibles; dependen del checkpoint base, la GPU y la configuración del sampler.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mother Gothel - Rapunzel (zuraxe/mother-gothel-rapunzel) | LoRA de personaje | AnyIllustrious XL v011 / SDXL | 185,7 MB | MIT | Hugging Face (espejo) y Renderoverse |
| LoRA de personaje SDXL genérico (civitai/HF) | LoRA de personaje | SDXL / Illustrious | variable (100-300 MB típico) | variable según autor | Plataformas comunitarias |
| Checkpoint SDXL base | Modelo completo | SDXL | ~6,9 GB (FP16) | CreativeML Open RAIL++-M | Stability AI y mirrors |
| Illustrious XL | Modelo completo | SDXL | ~6,9 GB (FP16) | variable según versión | Hugging Face |

La comparación con alternativas concretas de personaje no está disponible en la información proporcionada, ya que no se han publicado métricas ni evaluaciones que permitan un contraste cuantitativo.

## Limitaciones y advertencias

- Contenido no apto para todas las audiencias: los metadatos indican entrenamiento con imágenes vestidas y desnudas; el repositorio está marcado como `not-for-all-audiences`.
- La licencia MIT cubre el archivo del adaptador, pero no concede derechos sobre el personaje, nombres o marcas de terceros; el autor declara que no es un lanzamiento oficial de los titulares de derechos.
- Resultados altamente dependientes del checkpoint base, el prompt, el strength del LoRA y los ajustes del sampler; no hay garantía de consistencia entre configuraciones.
- Riesgo de sobreajuste al estilo del dataset de entrenamiento y de degradación de la imagen si se aplica con strength elevado.
- No se documentan sesgos específicos, pero al ser un adaptador de personaje entrenado con un dataset no descrito, pueden aparecer sesgos de representación no controlados.
- Sin evaluación de calidad ni benchmarks publicados: no hay evidencia objetiva de rendimiento frente a alternativas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria documentada.
- Al ser un espejo, la disponibilidad futura del archivo depende del mantenimiento del repositorio; conviene conservar el SHA-256 para verificar integridad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/zuraxe/mother-gothel-rapunzel
- Listado original en Renderoverse: https://renderoverse.com/model/mother-gothel-rapunzel
- Plataforma Renderoverse: https://renderoverse.com/
