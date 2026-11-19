# yusuklee/fastmanga-sfx-style

## Resumen

FastManga SFX style es un modelo de vision especializado en el analisis de efectos de sonido (sound effects, SFX) presentes en paginas de manga. Desarrollado por el usuario yusuklee, parte de un ajuste fino del encoder visual de kha-white/manga-ocr-base (Apache-2.0) y anade un pequeno transformer a nivel de pagina junto a cuatro cabezas de clasificacion. El modelo no realiza OCR ni transcripcion: su tarea es predecir cuatro valores de renderizado para un recorte (crop) de SFX de manga: tipografia (font), inclinacion (skew), ratio de tamano de la primera letra y estiramiento (stretch).

Con 87.648.025 parametros totales y un repositorio de apenas 0,2 GB en pesos float16, es un modelo ligero pensado para integrarse en pipelines de procesamiento de manga, concretamente en el proyecto FastManga (modulo `Process/sfx_model.py`). Su relevancia actual reside en la automatizacion del lettering de efectos de sonido, una fase tradicionalmente manual en la localizacion y traduccion de manga, donde reproducir el estilo visual del SFX original es tan importante como traducir el texto.

La informacion publicada por el autor es muy escasa: no se detallan datos de entrenamiento, benchmarks ni idiomas soportados, y el repositorio no registra descargas ni likes en el momento de redactar esta ficha. Se trata, por tanto, de un modelo de nicho, experimental y de disponibilidad muy reciente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder visual (fine-tune de kha-white/manga-ocr-base) + transformer a nivel de pagina + cuatro cabezas de clasificacion |
| Parametros totales | 87.648.025 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en float16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (float16) |

## Arquitectura y entrenamiento

El modelo reutiliza el encoder visual de manga-ocr-base, un modelo originalmente entrenado para OCR de manga, y lo ajusta finamente para una tarea de regresion/clasificacion visual. Sobre las representaciones del encoder se anade un transformer de pequeno tamano que opera a nivel de pagina (page-level transformer) y cuatro cabezas de clasificacion independientes, cada una responsable de predecir uno de los cuatro atributos de renderizado del SFX: font, skew, ratio de tamano de la primera letra y stretch.

No se dispone de informacion sobre el volumen de tokens, la composicion del dataset de entrenamiento, el uso de RLHF/DPO ni innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal. La model card unicamente indica el origen del encoder, la estructura de cabezas y el formato float16 de los pesos. Los pesos estan publicados en safetensors y el repositorio ocupa 0,2 GB.

## Capacidades

- Prediccion de tipografia (font) para recortes de SFX de manga.
- Prediccion de inclinacion (skew) del texto del efecto de sonido.
- Prediccion del ratio de tamano de la primera letra respecto al resto.
- Prediccion del estiramiento (stretch) del renderizado.
- Procesamiento de recortes (crops) de SFX extraidos de paginas de manga.
- Integracion como componente del pipeline FastManga (`Process/sfx_model.py`).
- No realiza OCR, traduccion ni generacion de texto.
- No se documenta soporte de tool calling, agentes, vision general, audio ni modo de razonamiento explicito.

## Casos de uso

- Lettering automatizado de SFX en localizacion de manga: el modelo predice font, skew, ratio de la primera letra y stretch para que el equipo de retoque pueda reproducir el estilo visual del SFX original al sustituir el texto por su traduccion.
- Preprocesado en pipelines de traduccion de manga: integrado en FastManga, permite clasificar y parametrizar cada recorte de SFX antes de la fase de composicion, reduciendo el trabajo manual de maquetacion.
- Catalogacion y analisis de estilo: al predecir atributos de renderizado, permite agrupar SFX por estilo tipografico para estudios o herramientas de analisis de publicaciones manga.
- Asistencia a retocadores humanos: el modelo sugiere los cuatro parametros de renderizado como punto de partida editable, acelerando el ajuste fino manual.
- Control de calidad de reediciones: comparar los valores predichos sobre el SFX original y el renderizado de la edicion localizada para detectar desviaciones de estilo.
- Herramientas de edicion de manga asistida: servir como backend de un editor que aplique automaticamente transformaciones tipograficas coherentes con el SFX de origen.
- Prototipado de sistemas de restauracion o remasterizacion: usar las predicciones para reconstruir el aspecto de SFX en escaneos de baja calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float16 para los 87,6 M de parametros, mas el overhead del runtime; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; por ejemplo RTX 3050, RTX 4060, RTX 4090, A100 o H100 (estas ultimas sobredimensionadas para este modelo).
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el uso previsto es via PyTorch/safetensors dentro del pipeline FastManga.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FastManga SFX style | 87,6 M | no disponible | Prediccion de estilo de SFX | Apache-2.0 | Hugging Face |
| kha-white/manga-ocr-base | no disponible en la informacion proporcionada | no disponible | OCR de manga | Apache-2.0 | Hugging Face |
| Modelos de clasificacion visual genericos | variable | no disponible | Clasificacion de imagenes | variable | Hugging Face |

No se dispone de modelos directamente comparables en la misma tarea (prediccion de atributos de renderizado de SFX) en la informacion proporcionada. La comparacion mas relevante es con su modelo base, manga-ocr-base, del que hereda el encoder visual pero con un objetivo distinto (OCR frente a prediccion de estilo).

## Limitaciones y advertencias

- Informacion de entrenamiento no publicada: no se conocen dataset, volumen de datos ni proceso de ajuste, lo que dificulta evaluar sesgos y generalizacion.
- Ambito de aplicacion muy restringido: solo predice cuatro atributos de renderizado; no transcribe, traduce ni genera texto.
- Riesgo de alucinacion en sentido amplio: al ser un clasificador, puede producir predicciones erroneas de font, skew, ratio o stretch en recortes atipicos o de baja calidad.
- Sesgos potenciales derivados del dataset de manga empleado (no documentado): estilos tipograficos poco representados pueden predecirse mal.
- Idiomas soportados no disponibles: no se especifica si el modelo es independiente del idioma del SFX o si esta sesgado hacia el japones.
- Sin benchmarks publicados: no hay evidencia cuantitativa de precision por atributo.
- Licencia Apache-2.0: permite uso comercial, pero el usuario debe verificar las condiciones del modelo base manga-ocr-base y de cualquier dataset subyacente.
- Repositorio sin descargas ni likes: escasa validacion por parte de la comunidad; tratar como modelo experimental.
- Pesos en float16: requiere runtime compatible con safetensors y precision media; no se documentan versiones cuantizadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yusuklee/fastmanga-sfx-style
- Modelo base: https://huggingface.co/kha-white/manga-ocr-base
- Repositorio FastManga: https://github.com/yusuklee/FastManga
