# Suhrobch1k/Sulphur-2-base

## Resumen

Sulphur 2 base es un modelo de generación de vídeo texto-a-vídeo (text-to-video) derivado de Lightricks/LTX-2.3, publicado por el usuario Suhrobch1k en Hugging Face. Se distribuye como un ajuste del modelo base LTX-2.3 con la etiqueta declarada de "uncensored" y soporte nativo tanto para texto-a-vídeo (t2v) como para imagen-a-vídeo (i2v), además de los demás formatos que admite la familia LTX 2.3. El repositorio incluye pesos en safetensors y GGUF y se integra en el ecosistema diffusers.

El modelo cuenta con aproximadamente 9.197 millones de parámetros (9,2 mil millones) según los metadatos de los archivos safetensors, y el repositorio ocupa unos 187,4 GB, lo que refleja la presencia de múltiples variantes de precisión (fp8 mixed, bf16) junto con adaptadores LoRA de destilación y un componente adicional de mejora de prompts empaquetado en GGUF con su archivo mmproj. La model card menciona variantes "dev" (fp8mixed y bf16) y una LoRA de destilación que debe usarse en lugar de los pesos completos, no junto a ellos.

Su relevancia actual es acotada y de nicho: se trata de un modelo comunitario sin benchmarks publicados, sin licencia declarada y con cero descargas en el momento de la ficha, orientado a generación de vídeo sin filtros de contenido. No dispone de información sobre idiomas soportados ni de resultados de evaluación, por lo que cualquier uso en producción exige una validación propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusión para vídeo, derivado de Lightricks/LTX-2.3; librería diffusers) |
| Parametros totales | 9.197.093.888 (~9,2 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp8 mixed, bf16, GGUF (según model card y tags) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna. Se sabe que es un modelo de difusión para generación de vídeo integrado en la librería diffusers, con pipeline text-to-video, y que deriva del modelo base Lightricks/LTX-2.3 (etiquetado como base_model y base_model:quantized). La model card indica que soporta de forma nativa tanto texto-a-vídeo como imagen-a-vídeo, además de "todos los demás formatos de LTX 2.3", pero no especifica el tipo de backbone (transformer de difusión, híbrido, etc.), el número de tokens de entrenamiento ni la composición del dataset.

Tampoco se documentan procesos de RLHF, DPO ni detalles de destilación más allá de la existencia de una LoRA de destilación recomendada para el arranque. El autor menciona que la inferencia oficial "llegará pronto" y que la model card se actualizará con instrucciones de configuración y de entrenamiento adicional. No hay información sobre innovaciones técnicas concretas (atención lineal, decodificación especulativa, etc.).

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) de forma nativa.
- Generación de vídeo a partir de imagen (image-to-video) de forma nativa.
- Soporte de los demás formatos de la familia LTX 2.3, según la model card (sin detallar cuáles).
- Componente de mejora de prompts (prompt enhancer) empaquetado en GGUF con archivo mmproj, pensado para cargarse en LM Studio; acepta texto e imagen como entrada.
- Uso de LoRA de destilación para acelerar o simplificar la generación.
- Modelo declarado como "uncensored", es decir, sin filtros de contenido explícitos según el autor.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, matemáticas, código ni audio.

## Casos de uso

- Generación de clips de vídeo a partir de descripciones textuales: el modelo permite crear secuencias de vídeo directamente desde prompts, adecuado para prototipado rápido de ideas visuales sin necesidad de rodaje.
- Animación de imágenes fijas (image-to-video): a partir de una fotografía o ilustración se pueden generar movimientos y transiciones, útil para contenidos de redes sociales o presentaciones.
- Previsualización de storyboards: equipos de producción pueden convertir guiones breves en borradores animados para evaluar encuadres y ritmo antes de la producción final.
- Generación de material para vídeo musical o arte experimental: la ausencia declarada de censura permite explorar contenido que otros modelos filtran, siempre que se respeten las obligaciones legales aplicables.
- Iteración creativa con el prompt enhancer: el componente GGUF permite reescribir y enriquecer prompts (con texto e imagen) antes de pasarlos al generador, mejorando la coherencia del resultado en flujos de trabajo con LM Studio.
- Investigación sobre modelos de difusión de vídeo: al ser un ajuste de LTX-2.3 con variantes fp8 y bf16 y LoRA de destilación, sirve para estudiar técnicas de cuantización y destilación en generación de vídeo.
- Integración en pipelines de diffusers: al declararse compatible con endpoints y con la librería diffusers, puede incorporarse en servicios de generación por lotes para crear catálogos de clips cortos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, un modelo de ~9,2 mil millones de parámetros en bf16 requiere del orden de 18-20 GB solo para pesos, a los que hay que sumar el estado de activaciones y el decodificador de vídeo; la variante fp8 mixed reduce esta cifra aproximadamente a la mitad. Estas estimaciones no están confirmadas por el autor.
- GPU recomendadas: no disponibles. Por tamaño, cabría esperar ejecución en GPUs de 24 GB o más (RTX 4090, A100 40/80 GB, H100) para las variantes bf16, y en GPUs de 16-24 GB para fp8/GGUF, sin confirmación oficial.
- Compatibilidad con GPU de consumo: probable en RTX 4090 (24 GB) y posiblemente en GPUs de 16 GB con cuantización GGUF, pero no verificado.
- Opciones de despliegue: diffusers (librería declarada), LM Studio para el prompt enhancer en GGUF; no se documenta soporte explícito de vLLM, llama.cpp, Ollama ni TGI para el modelo de vídeo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sulphur 2 base | ~9,2 mil millones | no disponible | sin benchmarks publicados | no disponible | Hugging Face (0 descargas) |
| Lightricks/LTX-2.3 (base) | no disponible | no disponible | no disponible en esta ficha | no disponible | Hugging Face |
| Otros modelos text-to-video open source | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para una comparativa cuantitativa fiable con alternativas de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay métricas de calidad, coherencia temporal ni fidelidad al prompt, por lo que el rendimiento real es desconocido.
- Licencia no declarada: no se especifican condiciones de uso comercial, lo que impide asumir permisos de explotación; es imprescindible aclararlo con el autor antes de cualquier uso en producción.
- Modelo declarado "uncensored": puede generar contenido explícito o no apto; el usuario asume la responsabilidad legal y ética de su uso y distribución.
- Riesgo de alucinación visual y artefactos: al ser un modelo de difusión de vídeo, es esperable la aparición de incoherencias entre fotogramas, deformaciones anatómicas y deriva temporal, aunque no se cuantifica.
- Idiomas no documentados: se desconoce si los prompts en castellano funcionan correctamente.
- Repositorio muy pesado (187,4 GB): requiere espacio en disco considerable y una gestión cuidadosa de variantes y LoRA.
- Confusión potencial en el uso: el autor advierte de no usar simultáneamente la LoRA de destilación y los pesos completos, y de que los flujos de trabajo actuales referencian "sulphur_final".
- Estado incipiente: inferencia oficial "próximamente", documentación incompleta y cero descargas, lo que indica falta de validación por la comunidad.
- Sin información sobre sesgos: no se documentan sesgos conocidos ni evaluaciones de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Suhrobch1k/Sulphur-2-base
- Modelo base: https://huggingface.co/Lightricks/LTX-2.3
- X del autor: https://x.com/FusionCow11
- Discord: https://discord.gg/C3d56f39Ah
- Ko-fi: https://ko-fi.com/fusioncow
- CivitAI modelo base: https://civitai.red/models/2594061/sulphur-2-base
- CivitAI modelo cuantizado: https://civitai.red/models/2630742
- Merge i2v de TenStrip: https://huggingface.co/TenStrip/LTX2.3-10Eros
- Perfil de silveroxides: https://huggingface.co/silveroxides
- Perfil de TenStrip: https://huggingface.co/TenStrip
