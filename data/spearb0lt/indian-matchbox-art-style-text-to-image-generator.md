# spearb0lt/Indian-Matchbox-Art-Style-Text-to-Image-Generator

## Resumen

Indian Matchbox Art Style: Text-to-Image Generator es un conjunto de dos adaptadores LoRA de estilo publicados por el usuario spearb0lt en HuggingFace, pensados para generar etiquetas de cerillas (matchbox labels) de la India de estilo vintage a partir de un prompt de texto. No es un modelo generativo completo, sino dos adaptadores independientes que se montan sobre modelos base de difusión: uno para Stable Diffusion XL 1.0 (objetivo de predicción de ruido, DDPM) y otro para Stable Diffusion 3.5-medium (objetivo de flow matching). Ambos se entrenaron sobre el mismo conjunto de 197 etiquetas del dataset spearb0lt/Indian-Matchbox-Labels y comparten la palabra de activación `phlmx`.

El interés del proyecto es doble. Por un lado, cubre un nicho gráfico muy concreto —el de las etiquetas litográficas indias de mediados del siglo XX— con resultados que reproducen rasgos difíciles de obtener por prompting: tramas de línea grabada, paletas apagadas y titulares impresos dentro de la composición. Por otro, el autor publica la comparación entre las dos variantes y sus respectivos notebooks de entrenamiento, lo que lo convierte en un caso de estudio útil para quien quiera entender qué aporta una base con flow matching y codificador T5-XXL frente a una base con U-Net clásica a la hora de aprender un estilo y de escribir texto legible.

El repositorio ocupa 0,1 GB y no registra descargas ni likes en el momento de redactar esta ficha. Cada carpeta (`sdxl/` y `sd3.5-medium/`) incluye un `CARD.json` con todos los ajustes y métricas medidas de su entrenamiento, y los notebooks con sus salidas están publicados en GitHub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (bajo rango) sobre modelos de difusión latente: SDXL 1.0 (U-Net, predicción de ruido DDPM) y SD 3.5-medium (MMDiT con flow matching) |
| Parametros totales | No disponible (no se publica el recuento de parámetros del adaptador; el repositorio completo ocupa 0,1 GB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (viene determinada por el codificador de texto del modelo base; SD 3.5-medium incorpora un T5-XXL y atención conjunta texto-imagen) |
| Tipos de cuantizacion | No se publican variantes cuantizadas. Los pesos se distribuyen en safetensors y los ejemplos del autor cargan el pipeline en fp16 (SDXL) y bf16 (SD 3.5-medium) |
| Idiomas soportados | No disponible. Las leyendas de entrenamiento son titulares cortos en inglés, y el autor recomienda mantener el inglés en el prompt |
| Licencia | other — `sdxl-openrail-plus-plus-and-stabilityai-community` (LICENSE.md). Queda además sujeta a las licencias de los modelos base que se carguen |
| Formato de pesos | safetensors: `phlmx_style_sdxl_ep10_diffusers.safetensors` y `phlmx_style_sdxl_ep10_kohya.safetensors` (SDXL); `pytorch_lora_weights.safetensors` (SD 3.5-medium) |
| Modelos base | stabilityai/stable-diffusion-xl-base-1.0 y stabilityai/stable-diffusion-3.5-medium |
| Datos de entrenamiento | 197 etiquetas del dataset spearb0lt/Indian-Matchbox-Labels |
| Palabra de activacion (trigger) | `phlmx` |
| Libreria y pipeline | diffusers; text-to-image |
| Tamano del repositorio | 0,1 GB |
| Fecha de publicacion | 2026-10-02 (creado), 2026-10-02 (actualizado), segun la ficha de HuggingFace |

## Arquitectura y entrenamiento

El proyecto no entrena un modelo desde cero: entrena dos LoRA sobre dos bases distintas para la misma tarea de estilo. La variante SDXL se ajusta sobre Stable Diffusion XL 1.0 con el objetivo clásico de predicción de ruido (DDPM) y se distribuye en dos formatos equivalentes: uno para `diffusers` y otro en formato kohya, compatible con ComfyUI y AUTOMATIC1111. La variante SD 3.5-medium se ajusta con objetivo de flow matching y se distribuye como `pytorch_lora_weights.safetensors` para `diffusers`. El dataset es idéntico en ambos casos (197 etiquetas) y se activa con el token `phlmx`.

La diferencia de comportamiento entre las dos variantes procede en buena parte de las bases, no solo del entrenamiento. Según el autor, con la LoRA desactivada (escala 0.0) SD 3.5-medium ya escribe titulares cortos correctamente y genera color plano, mientras que SDXL no hace ninguna de las dos cosas; además, SD 3.5 cuenta con codificador T5-XXL y atención conjunta texto-imagen, y su LoRA se entrenó con leyendas escritas a mano que deletrean el titular de cada etiqueta. Esto se traduce en que la variante SD 3.5 produce titulares habitualmente bien escritos, color saturado y plano y contornos limpios, mientras que la variante SDXL ofrece una paleta apagada, textura de tinta sobre papel y línea grabada, más parecida a una etiqueta original desgastada, pero con titulares a menudo mal escritos. El autor publica comparativas lado a lado en `images/compare/`.

Ajustes recomendados por el autor: para SDXL, escala de LoRA 1.0, 30 pasos, CFG 6.0 y resoluciones de aproximadamente 1 megapíxel (832 x 1216, 1216 x 832, 1024 x 1024 y similares); para SD 3.5-medium, escala de LoRA 0.9, 28 pasos, CFG 5.0 y 768 x 1152 (dato truncado en la model card). El prompt de entrenamiento sigue el patrón `phlmx, a matchbox label, <qué se muestra>, <color de fondo>, headline '<una o dos palabras>'`.

## Capacidades

- Generación de imágenes text-to-image en estilo de etiqueta de cerillas india vintage, activada por el token `phlmx`.
- Composición de titulares integrados en la imagen: la variante SD 3.5-medium suele escribirlos correctamente; la variante SDXL falla con frecuencia en la ortografía.
- Reproducción de dos acabados distintos según la variante: litografía plana y saturada con contornos limpios (SD 3.5-medium) o estética desgastada de tinta sobre papel con línea grabada (SDXL).
- Control de fondo mediante prompt de color explícito, tal como se hizo en las leyendas de entrenamiento.
- Uso de prompt negativo: el autor emplea `photograph, photorealistic, 3d render, blurry, low quality, watermark`.
- Compatibilidad de despliegue amplia en el caso SDXL gracias al archivo en formato kohya (ComfyUI, AUTOMATIC1111) y en `diffusers`.
- No dispone de tool calling, capacidades de agente, razonamiento multi-paso, visión de entrada ni audio: es exclusivamente un adaptador de estilo para generación de imágenes.
- Capacidades multilingües: no disponibles; el autor recomienda titulares cortos en inglés.

## Casos de uso

- Diseño de packaging y mockups: generar etiquetas de estilo vintage para cajas, latas o cerillas de edición limitada, usando el prompt negativo para descartar acabados fotorrealistas y mantener la estética litográfica.
- Ilustración editorial y portadas: producir piezas con titulares integrados en la imagen, aprovechando que la variante SD 3.5-medium suele respetar la ortografía del texto solicitado.
- Merchandising y producto impreso: series de pósters, postales o camisetas con motivos de etiquetas (tigres, flores de loto, cisnes, gallos) generados de forma reproducible fijando la semilla, tal como hace el autor en `images/image_prompts.json`.
- Fondos y assets para juegos o aplicaciones: generar un lote de viñetas de estilo coherente y recortarlas como sprites o elementos de interfaz con ambientación retro india.
- Preservación y estudio de patrimonio gráfico: crear variaciones plausibles de un corpus histórico de 197 etiquetas para investigación en diseño o historia de la impresión, sin reutilizar directamente las imágenes originales.
- Prototipado rápido en estudios de diseño: explorar direcciones visuales antes de encargar una ilustración manual, con iteraciones de 28-30 pasos y coste de cómputo bajo al ser solo un adaptador.
- Aumento de datos para investigación en visión por computador: generar un conjunto sintético etiquetado de imágenes de estilo consistente para probar clasificadores o detectores de texto en escenas gráficas.
- Estudio comparativo de métodos de difusión: el repositorio permite reproducir el mismo estilo con DDPM (SDXL) y con flow matching (SD 3.5-medium) usando datos idénticos, útil como banco de pruebas metodológico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo ofrece una comparación cualitativa entre las dos variantes (fidelidad del titular, tipo de color y de línea) y los archivos `CARD.json` con los ajustes y las métricas medidas de cada entrenamiento, sin cifras de FID, CLIP score ni métricas equivalentes.

## Requisitos de hardware

- Al ser adaptadores LoRA, el consumo de VRAM lo determina casi por completo el modelo base, no la LoRA.
- SDXL 1.0 en fp16: estimación orientativa de 8-10 GB de VRAM para inferencia a ~1 megapíxel. Cabe en GPUs de consumo con 12 GB o más (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090) y, con optimizaciones de memoria, en 8 GB.
- SD 3.5-medium en bf16: al incluir el codificador T5-XXL, el requisito es mayor; estimación orientativa de 12-16 GB de VRAM según resolución y backend. Cómodo en RTX 4090 (24 GB) y en GPUs de datacenter (A100, H100). En GPUs de 8-12 GB puede requerir carga secuencial de componentes o cuantización del texto codificador.
- El autor no publica cifras de latencia ni throughput, por lo que no hay datos medidos disponibles.
- Opciones de despliegue: `diffusers` para ambas variantes; ComfyUI y AUTOMATIC1111 para la variante SDXL mediante el archivo kohya; los archivos en formato kohya también son utilizables por otras interfaces compatibles con LoRA de SDXL.
- No aplica vLLM, llama.cpp, Ollama ni TGI: son herramientas para modelos de lenguaje, no para pipelines de difusión. Para difusión las alternativas equivalentes serían ComfyUI, AUTOMATIC1111, Fooocus o servidores basados en `diffusers`.
- Nota práctica: para la variante SDXL el ejemplo del autor carga el VAE `madebyollin/sdxl-vae-fp16-fix`, lo que evita artefactos numéricos en fp16.
- Para la variante SD 3.5-medium es necesario aceptar previamente la licencia del modelo base en HuggingFace antes de descargarlo.

## Comparativa con modelos similares

No se dispone de información sobre LoRAs comparables de estilo matchbox indio en el material proporcionado. La comparación relevante documentada por el autor es interna, entre las dos variantes del propio repositorio:

| Criterio | LoRA SDXL | LoRA SD 3.5-medium |
|---|---|---|
| Modelo base | stabilityai/stable-diffusion-xl-base-1.0 | stabilityai/stable-diffusion-3.5-medium |
| Objetivo de entrenamiento | Predicción de ruido (DDPM) | Flow matching |
| Codificador de texto | El propio de SDXL (Sin T5) | Incluye T5-XXL con atención conjunta texto-imagen |
| Datos de entrenamiento | 197 etiquetas de Indian-Matchbox-Labels | Las mismas 197 etiquetas |
| Palabra de activación | `phlmx` | `phlmx` |
| Fidelidad del titular | A menudo mal escrito | Habitualmente correcto |
| Estética | Paleta apagada, textura de tinta sobre papel, línea grabada | Color plano y saturado, contornos limpios |
| Formatos publicados | safetensors diffusers y kohya | safetensors diffusers |
| Compatibilidad de herramientas | Amplia (ComfyUI, AUTOMATIC1111, diffusers) | diffusers (y las interfaces que lo soporten) |
| Escala de LoRA recomendada | 1.0 | 0.9 |
| Pasos y CFG recomendados | 30 pasos, CFG 6.0, ~1 MP | 28 pasos, CFG 5.0, 768 x 1152 (dato truncado) |

## Limitaciones y advertencias

- No es un modelo autónomo: requiere descargar y ejecutar el modelo base correspondiente, con su propio coste de VRAM y su propia licencia.
- La licencia declarada es `other` (`sdxl-openrail-plus-plus-and-stabilityai-community`) y remite a un `LICENSE.md`. Al combinar el adaptador con SDXL 1.0 o con SD 3.5-medium, se aplican también las condiciones de OpenRAIL++ y de la Stability AI Community License, que imponen restricciones de uso comercial (umbrales de facturación anual para la comunidad) y obligaciones de atribución. Conviene revisar ambos textos antes de un uso en producción.
- Riesgo de texto mal escrito en la variante SDXL: el propio autor advierte de que los titulares suelen aparecer con faltas. Si el texto debe ser legible, la variante SD 3.5-medium es la opción indicada.
- El estilo se limita prácticamente a la estética de etiqueta de cerillas india; forzar otros estilos exigirá desplazar la LoRA o cambiar de modelo, ya que la LoRA está fuertemente orientada a ese dominio.
- Sesgos de representación: el corpus de entrenamiento son 197 etiquetas históricas de una tradición gráfica y una época concretas, por lo que se reproducirán sus convenciones visuales, iconografía y posibles estereotipos de la época. Algunos titulares históricos de estas etiquetas pueden resultar ofensivos en la actualidad (el propio autor emplea ejemplos con términos como "PUSSY" o "COCK BRAND" procedentes de etiquetas originales).
- Riesgo de alucinación gráfica: la variante SDXL puede generar texto ilegible o pseudo-texto, y ambas variantes pueden deformar anatomías sencillas en composiciones complejas.
- Idioma: no hay datos publicados sobre soporte multilingüe y las leyendas de entrenamiento están en inglés; se recomienda no contar con titulares correctos en otros idiomas.
- Rendimiento no cuantificado: no hay FID, CLIP score ni ninguna métrica objetiva publicada, solo comparaciones visuales.
- Adopción mínima: cero descargas y cero likes en el momento de redactar la ficha, sin garantía de mantenimiento ni soporte por parte del autor.
- Existen incoherencias menores en la documentación (el fragmento de 768 x 115 queda truncado y las fechas de publicación son posteriores a la fecha de consulta habitual), por lo que conviene verificar los ajustes de inferencia en los notebooks del repositorio de GitHub.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/spearb0lt/Indian-Matchbox-Art-Style-Text-to-Image-Generator
- Dataset de entrenamiento: https://huggingface.co/datasets/spearb0lt/Indian-Matchbox-Labels
- Notebooks de entrenamiento (GitHub): https://github.com/spearb0lt/Indian-Matchbox-Art-Style-Text-to-Image-Generator
- Modelo base SDXL 1.0: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Modelo base SD 3.5-medium: https://huggingface.co/stabilityai/stable-diffusion-3.5-medium
- VAE empleado en el ejemplo de SDXL: https://huggingface.co/madebyollin/sdxl-vae-fp16-fix
- Carpeta de la LoRA SDXL: https://huggingface.co/spearb0lt/Indian-Matchbox-Art-Style-Text-to-Image-Generator/tree/main/sdxl
- Carpeta de la LoRA SD 3.5-medium: https://huggingface.co/spearb0lt/Indian-Matchbox-Art-Style-Text-to-Image-Generator/tree/main/sd3.5-medium
- Licencia: LICENSE.md en el repositorio del modelo
