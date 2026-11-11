# XcaliburMoon/xcmcomic-flux3-klein

## Resumen

xcmcomic-flux3-klein es un adaptador LoRA de rango 16 entrenado por el usuario XcaliburMoon sobre el modelo base `black-forest-labs/flux-3-image-klein-base`, un modelo de difusion texto-a-imagen de la familia FLUX.3. El adaptador no busca reproducir personajes ni estilos artisticos completos, sino mejorar un aspecto muy concreto y problematico del modelo base: el renderizado de rotulacion (lettering) dentro de vinedas de comic. El modelo base dibuja bien las vinedas pero escribe mal las cadenas de texto cortas que se le piden, y este LoRA se entrena especificamente sobre el emparejamiento entre las palabras rotuladas y los pixeles que las contienen.

El adaptador se entrena sobre 184 vinedas de comic con captions que citan literalmente el texto incrustado en la imagen, lo que constituye una supervision directa sobre la tipografia. Se trata de un adaptador de estilo y tipografia, no de personajes, y su activacion requiere el trigger `xcmcomic style` al inicio del prompt. El repositorio incluye el adaptador final en bf16 y fp16, checkpoints intermedios, el dataset, la configuracion de entrenamiento, los logs y builds GGUF.

La relevancia de esta ficha es doble: por un lado documenta un caso de uso muy especifico (rotulacion de comic) dentro del ecosistema FLUX; por otro, la propia model card es inusualmente honesta sobre los resultados, mostrando que el entrenamiento apenas movio la loss y que la mejora se limita a cadenas de hasta tres palabras, sin resolver la ortografia de parrafos completos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusion texto-a-imagen FLUX.3 (base `flux-3-image-klein-base`) |
| Parametros totales | no disponible (el adaptador es un LoRA de rango 16; el modelo base se describe como de 5.6B en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen; no hay ventana de contexto textual especificada) |
| Tipos de cuantizacion | bf16 y fp16 en safetensors; builds GGUF indicados en `quants/manifest.json` (tamanos y error de cuantizacion no detallados en la informacion disponible) |
| Idiomas soportados | no disponible |
| Licencia | FLUX Kommunity License (`flux-kommunity-license`) |
| Formato de pesos | safetensors (bf16 y fp16), GGUF |
| Rango / alpha del LoRA | 16 / 16 |
| Resolucion de entrenamiento | 1024 px (bucket nativo) |
| Pasos de entrenamiento | 2000 (10.9 epocas sobre 184 imagenes) |
| Trigger | `xcmcomic style` al inicio del prompt |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 16 aplicado sobre el modelo base `flux-3-image-klein-base`, que la model card describe como el paquete no destilado de FLUX.3 (frente a los pesos destilados `-comfy`, entrenados a 16 pasos con alpha 16 y no aptos para el mismo tipo de fine-tuning). El entrenamiento se realizo con ai-toolkit, con learning rate 1e-4, optimizador adamw8bit y scheduler cosine, batch 1 con gradient checkpointing, timestep shift 6.93 y text encoder congelado con embeddings cacheados (184 captions unicas, una codificacion cada una). El caption dropout se fijo en 0.0 deliberadamente, ya que el objetivo es que el modelo atienda al texto rotulado en lugar de ignorarlo.

El dataset consta de 184 vinedas de comic a 1024 px de ancho nativo, con captions que citan literalmente la rotulacion incrustada en los pixeles. El entrenamiento completo se ejecuto el 2026-11-07 en una A100 SXM4 de 80 GB: 2000 pasos en 35 minutos 28 segundos a 1.04 s/it, con un coste total de 1.91 USD por 1 hora 52 minutos de instancia facturada (incluyendo descarga del base de 19 GB, construccion de entorno y dos rondas de muestras). El dato mas relevante es que la loss apenas se movio: 0.728 en los pasos 1-100, 0.729 en 900-1100 y 0.703 en 1901-2000, una caida del 3.4 por ciento que indica una perturbacion pequena del modelo base mas que un reentrenamiento efectivo. El autor lo atribuye a capacidad y presion de entrenamiento insuficientes (rango 16, lr 1e-4, 10.9 epocas sobre solo 184 imagenes) para mover un modelo de 5.6B.

## Capacidades

- Generacion de imagenes texto-a-imagen de vinedas de comic con estilo y rotulacion condicionados por el trigger `xcmcomic style`.
- Mejora de la calidad de las formas de las letras (letterforms): en las muestras, los clusters de glifos malformados del paso 0 se convierten en letras bien dibujadas en el paso 2000.
- Mejora de la ortografia en cadenas cortas citadas (hasta aproximadamente tres palabras), como `LAST CALL` o `I told you.`.
- No mejora la ortografia de parrafos ni de burbujas multilinea de cuatro o cinco lineas, que siguen siendo pseudo-texto en el paso 2000.
- No es un adaptador de personajes: no preserva ni reproduce personajes concretos.
- No se documentan capacidades de tool calling, agentes, vision ni audio (es un modelo de generacion de imagen).
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Prototipado de vinedas de comic con rotulacion legible en cadenas cortas: util para bocetos y storyboards donde los bocadillos llevan textos de una a tres palabras (onomatopeyas, titulos, carteles) y se necesita que el modelo base no genere glifos deformes.
- Generacion de carteles y senalizacion diegetica dentro de la vineda: el adaptador mejora la legibilidad de rotulos cortos en escenarios, puertas o telefonos, aunque la model card advierte que los carteles pequenos siguen siendo incoherentes.
- Exploracion de estilo grafico de comic: al ser un adaptador de estilo y tipografia, sirve para fijar una estetica de rotulacion consistente en una serie de imagenes generadas con el mismo trigger.
- Investigacion sobre supervision de tipografia en modelos de difusion: el repositorio incluye dataset, configuracion, logs y muestras por paso, lo que lo convierte en un caso reproducible para estudiar como se comporta el lettering bajo fine-tuning de bajo rango.
- Evaluacion comparativa de checkpoints: los checkpoints a 500, 1000 y 1500 pasos permiten estudiar la evolucion de la calidad tipografica sin reentrenar.
- Base para un futuro reentrenamiento con mayor rango y recortes de las burbujas: la model card documenta explicitamente las mejoras propuestas (rango 32/64, lr 3e-4, 30 repeticiones, crops nativos de la rotulacion), lo que sirve como punto de partida documentado para quien quiera continuar el trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card aporta unicamente metricas de entrenamiento y evaluacion cualitativa de muestras:

| Metrica | Valor |
|---|---|
| Loss media, pasos 1-100 | 0.728 |
| Loss media, pasos 900-1100 | 0.729 |
| Loss media, pasos 1901-2000 | 0.703 |
| Caida total de loss | 3.4 por ciento en 2000 pasos |
| Tiempo de entrenamiento | 35 min 28 s (2000 pasos, 1.04 s/it) |
| Coste del run | 1.91 USD (1 h 52 min a 1.021 USD/h) |
| Hardware de entrenamiento | 1x A100 SXM4 80 GB |

Evaluacion cualitativa de muestras (50 pasos, guidance 3.5, misma semilla en paso 0 y paso 2000): mejora clara en formas de letras; mejora en cadenas cortas citadas; sin mejora en burbujas multilinea ni en carteles pequenos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; depende del modelo base FLUX.3 (5.6B) y del pipeline de difusion, no solo del adaptador LoRA, que anade una carga minima.
- GPU de entrenamiento documentada: 1x A100 SXM4 80 GB, con 19 GB de descarga del base y entrenamiento a 1.04 s/it.
- GPU recomendadas para inferencia: no especificadas en la informacion disponible; el modelo base requiere previsiblemente GPUs de gama alta (A100, H100) o consumer de gran VRAM, pero no se aportan cifras.
- Ajuste en GPU consumer: no disponible.
- Opciones de despliegue: el repositorio incluye builds GGUF con manifiesto (`quants/manifest.json`) y comandos de construccion y verificacion en `quants/README.md`, lo que sugiere despliegue via runtimes compatibles con GGUF; no se detallan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de otros adaptadores LoRA de rotulacion de comic ni comparativas con modelos de la misma categoria, y no se dispone de resultados de benchmarks que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- La loss apenas descendio (3.4 por ciento en 2000 pasos); el adaptador es una perturbacion pequena del modelo base y no un reentrenamiento profundo.
- La mejora en ortografia se limita a cadenas de hasta aproximadamente tres palabras; las burbujas multilinea de cuatro o cinco lineas siguen generando pseudo-texto.
- Los carteles pequenos y la senalizacion secundaria no mejoran de forma fiable.
- No es un adaptador de personajes: no preserva identidades ni disenos de personajes concretos.
- El entrenamiento se realizo con solo 184 imagenes y 10.9 epocas, lo que el propio autor senala como insuficiente en capacidad y presion de entrenamiento.
- La licencia es la FLUX Kommunity License, que impone restricciones de uso comercial; debe revisarse el texto completo antes de cualquier despliegue en produccion.
- Riesgo de alucinacion tipografica: el modelo puede generar texto plausible pero incorrecto, especialmente en cadenas largas.
- Sesgos conocidos: no documentados en la informacion disponible.
- Limitaciones de idioma: no documentadas; el dataset de entrenamiento esta compuesto por captions en ingles segun los ejemplos de la model card.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/XcaliburMoon/xcmcomic-flux3-klein
- Modelo base: https://huggingface.co/black-forest-labs/flux-3-image-klein-base
- Licencia del modelo base: https://huggingface.co/black-forest-labs/flux-3-image-klein-base/blob/main/LICENSE.md
- Dataset de entrenamiento: https://huggingface.co/datasets/XcaliburMoon/xcmcomic-flux3-klein
