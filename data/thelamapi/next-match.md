# thelamapi/Next-Match

## Resumen

Next Match es un modelo multimodal de recuperación de imágenes compuestas (composed image retrieval) desarrollado por thelamapi bajo el paraguas de Next Lab. Resuelve una tarea concreta: dado un producto de referencia en forma de imagen y una instrucción textual breve en turco o inglés que describe una modificación ("bunun kırmızı olanı", "same but a hat"), el modelo devuelve el artículo del catálogo que coincide con la descripción combinada. La innovación reside en que ni la imagen sola ni el texto solo bastan para resolver la consulta: la imagen encuentra productos parecidos pero en el color equivocado, y el texto encuentra objetos del atributo pedido pero de cualquier categoría; solo la fusión de ambas señales acierta.

El modelo es deliberadamente pequeño y experimental. La arquitectura combina un codificador de imágenes convolucional de cuatro bloques que proyecta a un espacio de 64 dimensiones, un codificador de texto con stemming específico para turco sobre un vocabulario cerrado de 61 palabras, y una fusión que interpreta el texto como una edición residual sobre la característica de la imagen. No es un modelo generativo ni un LLM: es un sistema de recuperación entrenado con InfoNCE sobre un catálogo sintético de iconos de producto dibujados proceduralmente (8 categorías, 8 colores, 3 patrones).

Es relevante ahora porque ilustra un patrón de diseño útil para sistemas de búsqueda visual en comercio electrónico: separar la identidad del producto de los atributos editables y usar el lenguaje como delta sobre la representación visual. Los resultados publicados en 1600 consultas de test sobre un catálogo de 192 ítems son contundentes en su dominio (Recall@1 de 0,932 global), aunque el propio autor advierte que el dominio es de juguete y que las fotos reales quedan fuera de la distribución de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de imagen convolucional (4 bloques, 16/32/64/64 canales) + MLP; codificador de texto con embeddings de palabra y MLP; fusión residual `q = normalise(f_img + MLP([f_img, f_text]))` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (vocabulario cerrado de 61 palabras; no es un modelo de contexto) |
| Tipos de cuantizacion | no disponible (pesos exportados para ejecución en `nlrt.js`; no se documentan cuantizaciones) |
| Idiomas soportados | Turco (tr) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (exportados para `nlrt.js`; el repo indica `pytorch` como librería) |

## Arquitectura y entrenamiento

La arquitectura es un sistema de tres codificadores entrenados conjuntamente. El codificador de imagen usa cuatro bloques convolucionales con 16, 32, 64 y 64 canales respectivamente, seguidos de una capa lineal que proyecta a 64 dimensiones; las claves del catálogo son características de imagen normalizadas en L2. El codificador de texto aplica minúsculas con reglas específicas del turco y stemming por prefijo más largo sobre un vocabulario de 61 palabras, de modo que formas como "kırmızısı" u "olanını" siguen casando con su raíz; después calcula la media de los embeddings de palabra y la pasa por un MLP. La fusión combina ambas señales como `q = normalise(f_img + MLP([f_img, f_text]))`, es decir, el texto predice una edición residual sobre la característica visual en lugar de concatenarse sin más.

El entrenamiento se realizó con InfoNCE y temperatura τ = 0,1, en 6000 pasos con batch de 128, sobre un catálogo sintético generado proceduralmente (8 categorías × 8 colores × 3 patrones). Se entrenaron dos baselines con el mismo presupuesto de arquitectura y pasos: uno solo de imagen (codificador de imagen más cabeza MLP) y otro solo de texto (codificador de texto contra sus propias claves de imagen). El entrenamiento se ejecutó en una NVIDIA L4 y el perfil de cómputo está documentado como completo. El Space ejecuta los tres codificadores con `nlrt.js` sobre los pesos exportados, con una diferencia máxima absoluta de paridad en Node de 1,6653345369377348e-16.

## Capacidades

- Recuperación de imágenes compuestas: combina una imagen de referencia con una instrucción textual de edición para devolver el ítem correcto de un catálogo.
- Edición por color: instrucciones del tipo "bunun kırmızı olanı" cambian el color del producto de referencia manteniendo categoría y patrón.
- Edición por patrón: instrucciones como "çizgili olanı" cambian el patrón (liso, rayas, otros) preservando el resto de atributos.
- Edición por categoría: instrucciones que sustituyen el tipo de producto ("same but a hat") funcionan con Recall@1 de 1,000 en el conjunto de test.
- Edición combinada color + patrón: soporta modificaciones de dos atributos simultáneamente.
- Bilingüe turco-inglés: procesa instrucciones en ambos idiomas, con mejor rendimiento en turco (Recall@1 de 0,995) que en inglés (0,878).
- Robustez a reformulaciones: generaliza parcialmente a plantillas de frase no vistas en entrenamiento (Recall@1 de 0,782 en `template=held-out`).
- Robustez a combinaciones de atributos no vistas: Recall@1 de 0,931 en `combo=held-out`, combinaciones de atributos nunca renderizadas durante el entrenamiento.
- No soporta tool calling, function calling, agentes, generación de texto, razonamiento multi-paso, visión general, audio ni modo thinking: es exclusivamente un recuperador.

## Casos de uso

- Búsqueda visual en catálogos de comercio electrónico: el usuario sube una foto de un producto y escribe "en azul" o "the striped one"; el modelo devuelve el ítem del catálogo que cumple la edición. Adecuado porque separa identidad visual y atributo editable, que es exactamente el patrón que necesita un buscador de moda o decoración.
- Filtrado interactivo de inventario: un operador parte de una referencia y aplica ediciones sucesivas para localizar variantes concretas de un SKU sin recorrer manualmente el catálogo.
- Prototipado de interfaces de búsqueda multimodal: sirve como referencia funcional y reproducible (con Space público y evaluación incluida) para validar pipelines de composed image retrieval antes de invertir en un codificador visual preentrenado.
- Recomendación de variantes de producto: dado un artículo que el usuario ya posee o está viendo, sugerir la misma prenda en otro color o patrón mediante una instrucción corta, con latencia baja por el tamaño reducido del modelo.
- Evaluación comparativa de arquitecturas de fusión: los baselines de imagen sola y texto solo, con el mismo presupuesto de entrenamiento, permiten medir cuánto aporta realmente la fusión residual frente a alternativas más simples.
- Docencia e investigación en recuperación multimodal: el dominio sintético controlado (8×8×3) y las particiones `template=held-out` y `combo=held-out` hacen el modelo útil para estudiar generalización composicional sin ruido de datos reales.
- Búsqueda en catálogos de iconos o ilustraciones planas: dentro de su dominio nativo (iconos sobre fondo liso), el Recall@1 de 0,932 global es directamente utilizable en producción para ese tipo de contenido.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 1600 consultas de test, catálogo de 192 ítems y renderizados no vistos. Recall@1 / Recall@5:

| Grupo de consulta | n | Imagen + texto (Next Match) | Solo imagen | Solo texto |
|---|---:|---:|---:|---:|
| all | 1600 | 0,932 / 0,966 | 0,000 / 0,316 | 0,054 / 0,263 |
| edit=color | 648 | 0,994 / 1,000 | 0,000 / 0,358 | 0,051 / 0,218 |
| edit=pattern | 311 | 0,836 / 0,897 | 0,000 / 0,878 | 0,016 / 0,074 |
| edit=category | 322 | 1,000 / 1,000 | 0,000 / 0,000 | 0,031 / 0,183 |
| edit=color+pattern | 319 | 0,834 / 0,931 | 0,000 / 0,000 | 0,122 / 0,621 |
| lang=tr | 747 | 0,995 / 1,000 | 0,000 / 0,317 | 0,051 / 0,258 |
| lang=en | 853 | 0,878 / 0,937 | 0,000 / 0,314 | 0,057 / 0,267 |
| template=seen | 1104 | 1,000 / 1,000 | 0,000 / 0,323 | 0,057 / 0,251 |
| template=held-out | 496 | 0,782 / 0,891 | 0,000 / 0,298 | 0,048 / 0,290 |
| combo=seen | 1192 | 0,933 / 0,966 | 0,000 / 0,348 | 0,057 / 0,296 |
| combo=held-out | 408 | 0,931 / 0,966 | 0,000 / 0,221 | 0,047 / 0,167 |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ni comparaciones con modelos de recuperación de terceros.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamaño de los codificadores (cuatro bloques convolucionales de hasta 64 canales y proyección a 64 dimensiones) el modelo es extremadamente ligero y cabe holgadamente en cualquier GPU consumer, aunque el autor no publica cifras de VRAM.
- GPU recomendadas: el entrenamiento se realizó en una NVIDIA L4; para inferencia no se especifican requisitos, y por escala cualquier GPU moderna es sobrada.
- Cabe en GPU consumer: sí, con margen amplio; también en CPU y en el navegador, como demuestra el Space que ejecuta los tres codificadores con `nlrt.js`.
- Opciones de despliegue: `nlrt.js` sobre pesos exportados (usado en el Space); PyTorch mediante el módulo `inference.py` con las funciones `load()` y `search()`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de comparaciones publicadas con otros modelos de composed image retrieval en la información proporcionada. Los únicos puntos de comparación documentados son los baselines internos del propio autor, entrenados con el mismo presupuesto de arquitectura y pasos:

| Modelo | Modalidad | Recall@1 (all) | Recall@5 (all) | Licencia |
|---|---|---:|---:|---|
| Next Match | Imagen + texto | 0,932 | 0,966 | Apache-2.0 |
| Baseline solo imagen | Imagen | 0,000 | 0,316 | Apache-2.0 (mismo repo) |
| Baseline solo texto | Texto | 0,054 | 0,263 | Apache-2.0 (mismo repo) |

Frente a modelos de recuperación multimodal de propósito general (tipo CLIP o SigLIP), la comparación no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Dominio de juguete: entrenado sobre iconos planos dibujados proceduralmente con fondos lisos; las fotos de producto reales requieren un codificador visual preentrenado y datos de catálogo reales, según advierte el propio autor.
- Vocabulario cerrado de 61 palabras: cualquier término fuera de él se ignora silenciosamente; el Space muestra qué palabras se han entendido, pero en producción esto puede producir recuperaciones incorrectas sin señal de error.
- Fotos subidas por el usuario: quedan muy fuera de la distribución de entrenamiento y el autor las califica explícitamente como curiosidad, no como uso soportado.
- Riesgo de alucinación: no aplica en el sentido generativo (no produce texto), pero sí existe riesgo de recuperación espuria cuando la consulta cae fuera del vocabulario o del dominio visual.
- Sesgo idiomático: rendimiento notablemente inferior en inglés (Recall@1 de 0,878) que en turco (0,995), pese a declarar soporte para ambos.
- Degradación con reformulaciones: Recall@1 baja de 1,000 a 0,782 en plantillas de frase no vistas durante el entrenamiento.
- Sesgos demográficos y sociales: no evaluados ni documentados; el dataset sintético de iconos no contiene personas.
- Licencia Apache-2.0: permite uso comercial y modificación con atribución, sin restricciones adicionales documentadas.
- Repositorio sin descargas ni likes y con tamaño de 0,0 GB en el momento de la consulta; los ejemplos de fallo están en `evaluation.json` y el perfil de cómputo está documentado como completo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thelamapi/Next-Match
- Space de demostración: https://huggingface.co/spaces/thelamapi/Next-Match
