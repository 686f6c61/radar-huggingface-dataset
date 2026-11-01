# tkb77/oekaki-sketch-diffusion

## Resumen

Oekaki sketch diffusion es un modelo de difusión de muy pequeño tamaño (5,0 M de parámetros) desarrollado por tkb77 que genera dibujos de líneas de 64×64 píxeles en cinco categorías cerradas: círculo, cuadrado, triángulo, estrella y cara sonriente. Se trata de un DDPM de tipo U-Net con 200 pasos de difusión y anchura base 64, condicionado por clase y entrenado sobre el conjunto Quick, Draw! de Google Creative Lab. Su función dentro del proyecto Oekaki VLA es actuar como módulo de "imaginación": genera la imagen que posteriormente un modelo de visión-lenguaje-acción (VLA) convierte en trayectorias de dibujo para un robot.

El modelo es relevante no por su escala, sino por su carácter didáctico y su integración en un pipeline completo de robótica. Con un checkpoint de 0,1 GB y un coste de inferencia mínimo, sirve como banco de pruebas reproducible para experimentos de generación condicionada, guiado sin clasificador y muestreo DDIM con trayectorias intermedias exportables. La licencia Apache-2.0 y su adaptación desde `lcccluck/sketch-model` facilitan su reutilización y modificación.

La información pública es limitada: no hay pipeline declarado en HuggingFace, no se especifican idiomas (no aplica realmente, al ser un generador de imágenes) y no se han publicado benchmarks comparativos estándar. Los datos de calidad disponibles provienen de la propia model card: ninguna imagen vacía en 1000 muestras y un 99,9 % de dibujos generados reconocidos por un clasificador CNN independiente con 99,1 % de precisión en test sobre dibujos reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net DDPM (difusión denoising probabilistic), condicionada por clase, 200 timesteps, anchura base 64 |
| Parametros totales | 5,0 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen, salida 64×64) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en `last.pt`; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | no disponible (generador de imágenes; sin componente textual) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch checkpoint (`last.pt`, pickle) con pesos EMA; `config.json` con la configuración de entrenamiento |

## Arquitectura y entrenamiento

El modelo es un DDPM con backbone U-Net de 5,0 M de parámetros, 200 pasos de difusión y anchura base 64. Emplea condicionamiento por clase con guiado sin clasificador (classifier-free guidance) a escala 3,0 y los pesos publicados son los de la media móvil exponencial (EMA). El muestreo se realiza con DDIM a 50 pasos, y la implementación permite devolver las imágenes intermedias para generar animaciones de la trayectoria de denoising.

El entrenamiento se realizó durante 100 000 pasos con batch de 256 sobre 60 000 dibujos de Quick, Draw! por categoría (300 000 en total), filtrados para incluir solo dibujos reconocidos con un máximo de 8 trazos y renderizados con el renderizador de líneas común del proyecto. Se reservó un 10 % de los datos como conjunto de validación, con partición por `key_id`. El modelo deriva de `lcccluck/sketch-model` (Apache-2.0) y se ha adaptado al pipeline Oekaki VLA. No se documentan fases de RLHF ni DPO, algo esperable en un modelo generativo de imágenes de este tipo.

## Capacidades

- Generación de imágenes de líneas de 64×64 píxeles en cinco clases: círculo, cuadrado, triángulo, estrella y cara sonriente.
- Condicionamiento por clase explícito mediante etiqueta textual (`"star"`, etc.).
- Guiado sin clasificador con escala configurable (3,0 por defecto).
- Muestreo DDIM a 50 pasos con salida de imágenes intermedias para animación.
- Salida estructurada: además de la imagen (`out["image"]`, uint8 64×64), devuelve `out["segments"]` con los trazos para el robot.
- Control de semilla para reproducibilidad (`seed=0` en el ejemplo de la model card).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Módulo de imaginación en pipelines de robótica: el modelo genera la imagen objetivo que un VLA como `tkb77/smolvla-oekaki-goal` traduce en trayectorias de dibujo; encaja por su salida de trazos (`segments`) ya preparada para el robot.
- Generación de datos sintéticos de dibujos: útil para aumentar datasets de Quick, Draw! en las cinco clases con muestras reconocibles al 99,9 % por un juez CNN, a un coste computacional mínimo.
- Docencia y divulgación de modelos de difusión: con 5,0 M de parámetros y un checkpoint de 0,1 GB, permite explicar DDPM, guiado sin clasificador y DDIM en un portátil sin GPU dedicada.
- Pruebas de integración de pipelines VLA: al ser un componente pequeño y determinista por semilla, sirve para validar extremo a extremo la cadena generación-imaginación-acción antes de escalar a modelos mayores.
- Investigación en condicionamiento por clase: banco de pruebas controlado para comparar escalas de guidance, número de pasos DDIM o estrategias de limpieza (clean-up) sobre un dominio cerrado y medible.
- Generación de animaciones de trayectorias de denoising: la devolución de imágenes intermedias permite crear visualizaciones del proceso de difusión para blogs, papers o materiales didácticos.
- Prototipado de interfaces de dibujo asistido: integrable en demos donde el usuario elige una categoría y el sistema produce un boceto de líneas listo para exportar como trazos vectoriales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los únicos datos de calidad aportados por la model card son:

| Metrica | Valor |
|---|---|
| Imagenes vacias en 1000 muestras | 0 |
| Dibujos generados reconocidos por juez CNN | 99,9 % |
| Precision del juez CNN en dibujos reales (test) | 99,1 % |
| Pasos de entrenamiento | 100 000 |
| Batch de entrenamiento | 256 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el checkpoint ocupa 0,1 GB y el modelo tiene 5,0 M de parámetros, por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; funciona en cualquier GPU NVIDIA/AMD moderna e incluso en CPU para uso interactivo. Una RTX 4090 o A100 estarían sobredimensionadas para este modelo.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 3050, RTX 4090) y en iGPU con suficiente memoria compartida.
- Opciones de despliegue: la model card indica cargar el checkpoint exclusivamente con el código del repositorio `tkb77/oekaki-vla` mediante `oekaki.generator.imagine.Imaginer`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de difusión de imagen).
- Latencia y throughput estimados: no disponibles en la información proporcionada; con 50 pasos DDIM y 5,0 M de parámetros se espera una latencia muy baja, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion / dominio | Contexto / condicionamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tkb77/oekaki-sketch-diffusion | 5,0 M | 64×64, 5 clases de dibujo de líneas | Condicionado por clase, CFG 3,0 | Apache-2.0 | HuggingFace + GitHub |
| lcccluck/sketch-model | no disponible | Dibujos de líneas (modelo base del que deriva) | no disponible | Apache-2.0 | HuggingFace |
| Stable Diffusion (familia) | cientos de millones a miles de millones | 512×512 o superior, imágenes fotorrealistas y artísticas | Condicionado por texto | CreativeML OpenRAIL-M (varía por versión) | HuggingFace, múltiples despliegues |

La comparación con modelos de difusión de texto a imagen de gran escala no es directa: oekaki-sketch-diffusion está especializado en un dominio cerrado de cinco clases y no acepta prompts de texto libre. Frente a su modelo base `lcccluck/sketch-model`, la información disponible no permite comparar parámetros ni rendimiento, solo constatar la relación de derivación y la misma licencia Apache-2.0.

## Limitaciones y advertencias

- Dominio extremadamente cerrado: solo genera cinco clases (círculo, cuadrado, triángulo, estrella, cara sonriente); no acepta prompts de texto libre ni otras categorías.
- Resolución fija de 64×64 píxeles; no apta para imágenes de mayor tamaño sin reentrenamiento o superresolución externa.
- Sesgos conocidos: no documentados en la model card; al entrenarse sobre Quick, Draw! puede heredar sesgos de estilo y de representación del dataset (trazos, proporciones y convenciones de dibujo de los contribuyentes).
- Riesgo de alucinación: en modelos generativos de imagen se traduce en dibujos fuera de distribución o con trazos espurios; la model card reporta 0 imágenes vacías y 99,9 % de reconocimiento por el juez CNN, pero estas métricas provienen del propio autor y no de una evaluación independiente.
- Limitaciones de idioma: no aplica componente textual; las etiquetas de clase están en inglés (`"star"`, etc.).
- Restricciones de licencia: Apache-2.0 permite uso comercial y modificaciones con atribución; el dataset Quick, Draw! subyacente es CC BY 4.0 y requiere atribución a Google Creative Lab.
- Caveat de producción: el checkpoint `last.pt` es un pickle y debe cargarse solo con el código del repositorio `oekaki-vla`; cargar pickles de fuentes no verificadas supone un riesgo de seguridad.
- Sin pipeline declarado en HuggingFace ni benchmarks estándar publicados; la integración depende del repositorio GitHub del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tkb77/oekaki-sketch-diffusion
- Repositorio de código: https://github.com/tkb77/oekaki-vla (directorio `oekaki/generator/`)
- Modelo VLA asociado: https://huggingface.co/tkb77/smolvla-oekaki-goal
- Modelo base: https://huggingface.co/lcccluck/sketch-model
- Dataset Quick, Draw!: https://github.com/googlecreativelab/quickdraw-dataset
