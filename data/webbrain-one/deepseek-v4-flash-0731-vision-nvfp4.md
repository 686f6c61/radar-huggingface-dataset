# webbrain-one/DeepSeek-V4-Flash-0731-Vision-NVFP4

## Resumen

DeepSeek V4 Flash 0731 Vision (NVFP4) es un checkpoint de desarrollo publicado por WebBrain que añade capacidades de visión al modelo de texto DeepSeek V4 Flash 0731. Conecta el backbone de razonamiento y agente de DeepSeek con el encoder de visión MoonViT extraído de Kimi-K2.6, mediante un proyector PatchMerger entrenado por WebBrain. El objetivo es dotar a los agentes de navegador de comprensión del estado visual de la web: capturas de pantalla, gráficos, dashboards y la posición y apariencia de los controles.

El modelo tiene 304.637.403.566 parámetros (304,6 mil millones) y se distribuye en formato safetensors con precisión mixta: los pesos de los expertos enrutados están en NVFP4, mientras que atención, expertos compartidos, cabeza y MTP conservan los formatos fuente (FP8 y otros) del checkpoint original 0731. No es un checkpoint todo-NVFP4. La integración de visión es experimental y requiere un paquete de modelo/procesador externo y una revisión específica de SGLang con un parche de fuente. El repositorio pesa 176,5 GB y contiene 48 shards de texto sin cambios más los componentes de visión añadidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con encoder de visión MoonViT-3d y proyector PatchMerger (integracion no estandar) |
| Parametros totales | 304.637.403.566 (304,6 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el modelo base DeepSeek V4 Flash 0731 declara 1M de contexto segun fuentes externas, no confirmado para este checkpoint) |
| Tipos de cuantizacion | NVFP4 (expertos enrutados), FP8 y formatos fuente en atencion, expertos compartidos, cabeza y MTP |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (48 shards de texto + vision_tower.safetensors + mm_projector.safetensors) |

## Arquitectura y entrenamiento

El checkpoint combina tres componentes de distinta procedencia. El backbone de texto es una copia exacta de la conversion NVFP4 de MJPansa sobre DeepSeek V4 Flash 0731, que es un modelo MoE con mecanismos DSpark y MTP (multi-token prediction). La torre de vision es MoonViT-3d, extraida de Kimi-K2.6, con 329 tensores BF16 y congelada. El proyector PatchMerger de WebBrain, con 40.119.040 parametros en 6 tensores BF16, fue entrenado con el backbone y la torre congelados. Su operacion es: LayerNorm -> fusion de parches 2x2 -> Linear(4608, 4608) -> GELU -> Linear(4608, 4096).

Los IDs de routing de los tokens de texto se preservan intactos. Las posiciones de imagen reciben IDs de routing deterministas de una paleta de 64 IDs incluida en el repositorio. La integracion soporta un unico marcador literal `<image>` y como maximo 512 tokens de imagen fusionados. No es una arquitectura multimodal estandar de Transformers ni de SGLang; requiere el paquete externo de modelo/procesador y la revision de SGLang fijada en la documentacion de despliegue. El estado de validacion indica que aun no se ha vuelto a ejecutar una prueba completa de carga/arranque en GPU y de generacion de imagenes para este checkpoint ensamblado.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del modelo base DeepSeek V4 Flash 0731, incluyendo razonamiento multi-paso y comportamiento agente.
- Comprension de imagenes: procesa capturas de pantalla, graficos, dashboards y editores enriquecidos a traves del encoder MoonViT y el proyector PatchMerger.
- Soporte de tool calling y function calling: disponible a traves del backbone de texto, aunque no se detalla en la documentacion del checkpoint.
- Capacidades de agente: el modelo base esta disenado para tareas de agente, y la vision se anade para que el agente pueda interpretar el estado visual de la web.
- Capacidades multilingues: no documentadas para este checkpoint; se desconoce si el modelo base las conserva.
- Modo vision: integracion experimental con un unico marcador `<image>` y hasta 512 tokens de imagen fusionados.

## Casos de uso

- Agentes de navegador: el caso principal. Un agente puede recibir capturas de pantalla de una pagina web, interpretar la posicion y apariencia de los controles, y decidir la siguiente accion sin depender solo del texto extraido.
- Analisis de dashboards y graficos: el modelo puede leer paneles de control con graficos y tablas visuales, extrayendo tendencias o valores relevantes para tareas de monitorizacion.
- Asistencia en editores enriquecidos: comprender el estado visual de editores WYSIWYG, como la posicion del cursor, el formato aplicado o los elementos insertados, para automatizar tareas de maquetacion.
- Verificacion visual de interfaces: comparar una captura de pantalla con un estado esperado para detectar errores de renderizado o cambios no deseados en una aplicacion web.
- Automatizacion de pruebas de interfaz: generar descripciones de lo que se ve en pantalla y usarlas como entrada para pipelines de testing visual.
- Extraccion de informacion de imagenes tecnicas: diagramas de arquitectura, esquemas o capturas de terminales, donde el texto extraido por OCR no es suficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones de vision-language. El estado de validacion indica que las pruebas de paridad de texto y generacion de imagenes en hardware Blackwell aun no se han ejecutado para este checkpoint ensamblado.

## Requisitos de hardware

- VRAM estimada: 111,3 GB segun la entrada de LLM Explorer (dato externo, no confirmado por WebBrain).
- GPU recomendadas: hardware Blackwell (serie B200 o similar) por la cuantizacion NVFP4 y FP8; no se mencionan GPUs concretas en la documentacion.
- No cabe en GPUs de consumo: con 304,6 B de parametros y 176,5 GB de repositorio, se requiere hardware profesional o de centro de datos.
- Opciones de despliegue: SGLang con una revision especifica y un parche de fuente externo; no es compatible con vLLM, Ollama ni llama.cpp sin modificaciones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4-Flash-0731-Vision-NVFP4 (WebBrain) | 304,6 B | no disponible | Si (MoonViT) | other | Hugging Face |
| DeepSeek-V4-Flash-0731 (DeepSeek) | 304,6 B (aprox.) | 1M (segun DeepWiki) | No | other | Hugging Face |
| Kimi-K2.6 (Moonshot AI) | no disponible | no disponible | Si (MoonViT) | other | Hugging Face |

La comparativa se basa en los modelos base citados en la model card. DeepSeek V4 Flash 0731 es el origen del backbone de texto, y Kimi-K2.6 aporta la torre de vision. Este checkpoint es el unico de los tres que combina ambos, pero su integracion es experimental y no ha sido validada completamente.

## Limitaciones y advertencias

- Checkpoint de desarrollo: no es una version estable ni recomendada para produccion sin validacion previa.
- Validacion incompleta: no se ha ejecutado una prueba completa de carga en GPU y generacion de imagenes para el checkpoint ensamblado.
- Integracion experimental: requiere un paquete de modelo/procesador externo y un parche de fuente para SGLang; no funciona con Transformers ni SGLang estandar.
- Limitaciones de vision: soporta un unico marcador `<image>` y como maximo 512 tokens de imagen fusionados; no se garantiza el comportamiento con multiples imagenes.
- Licencia "other": los terminos exactos no estan especificados; hay que revisar la licencia del modelo base y de los componentes antes de cualquier uso comercial.
- Riesgo de alucinacion: no se han publicado evaluaciones de fiabilidad; el modelo puede inventar contenido visual o textual, especialmente en tareas de razonamiento complejo.
- Sesgos y limitaciones de idioma: no documentados; se desconoce el comportamiento en lenguas distintas del ingles o el chino.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/webbrain-one/DeepSeek-V4-Flash-0731-Vision-NVFP4
- Modelo base de texto: https://huggingface.co/MJPansa/DeepSeek-V4-Flash-0731-NVFP4
- Modelo base original: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Encoder de vision (Kimi-K2.6): https://huggingface.co/moonshotai/Kimi-K2.6
- Blog de WebBrain sobre la brecha entre modelos abiertos: https://www.webbrain.one/blog/american-chinese-open-model-frontier-gap-benchmark
- Documentacion de despliegue SGLang: https://huggingface.co/webbrain-one/DeepSeek-V4-Flash-0731-Vision-NVFP4/blob/main/docs/SGLANG_DEPLOYMENT.md
