# Thomas0202/promptcut-ia

## Resumen

PROMPTCUT IA es un modelo multimodal de tipo image-text-to-text publicado por el usuario Thomas0202 en Hugging Face, concebido como el motor de inferencia local de PROMPTCUT, un editor de vídeo gratuito para iPhone. Se trata de un ajuste fino mediante LoRA sobre el modelo base Qwen/Qwen3.5-2B (licencia Apache 2.0), con 2.000 millones de parámetros, distribuido exclusivamente en formato GGUF cuantizado para su ejecución con llama.cpp sobre Metal en dispositivos móviles.

El modelo resuelve un problema muy concreto: a partir de la transcripción de un clip y de una selección de fotogramas, genera un plan de gráficos en formato JSON estricto (títulos, rótulos inferiores, precios, listas de verificación, mapas, logotipos) indicando tipo, estilo, texto y temporización, y después actúa como crítico releyendo su propio plan para detectar problemas como texto sobre un rostro o exceso de elementos simultáneos. Todo el proceso ocurre en el teléfono, sin cuenta ni servidor, de modo que el vídeo del usuario no abandona el dispositivo.

Su relevancia actual radica en que ejemplifica el patrón de modelos pequeños y especializados desplegados en el borde (on-device) para tareas de edición asistida, sacrificando capacidades generales de asistente a cambio de fiabilidad en un esquema de salida concreto. Soporta italiano, inglés y español, y se distribuye en dos ficheros: el modelo de lenguaje en Q4_K_M (~1,3 GB) y el proyector de visión en Q8_0 (~0,36 GB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivado de Qwen3.5-2B; detalles internos de la arquitectura base no disponibles |
| Parametros totales | 2B (modelo base Qwen3.5-2B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (modelo de lenguaje), Q8_0 (proyector de visión) |
| Idiomas soportados | Italiano (it), inglés (en), español (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); no se distribuyen safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B, un transformer de 2.000 millones de parámetros, y se adapta mediante un ajuste fino LoRA. Según la model card, los datos de entrenamiento consisten en planes de edición y críticas generados por un modelo profesor de mayor tamaño y posteriormente revisados a mano. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron fases de RLHF o DPO. La incorporación de visión se materializa en un proyector multimodal independiente (`mmproj-promptcut-002-q8_0.gguf`), que se carga junto al modelo de lenguaje en llama.cpp mediante la interfaz `llama-mtmd-cli`.

La innovación técnica principal no reside en la arquitectura, sino en el diseño del bucle de trabajo: el modelo está afinado para emitir un esquema JSON estricto que la aplicación puede renderizar directamente, y para desempeñar un segundo papel de crítico que revisa ese mismo plan y señala errores de composición (texto sobre rostros, densidad excesiva de gráficos, temporización incorrecta). No se documentan técnicas como decodificación especulativa, atención lineal ni modos de razonamiento extendido.

## Capacidades

- Generación de planes de edición en JSON estricto: lista de gráficos con tipo, estilo, texto y temporización, consumible directamente por la aplicación.
- Función de crítico: relectura del plan generado para detectar texto sobre rostros, exceso de gráficos simultáneos y errores de temporización.
- Comprensión visual: análisis de fotogramas para evitar cubrir rostros y elegir colores y posiciones legibles.
- Chat de edición en lenguaje natural: instrucciones como «añade el precio al principio» o «hazlo más minimalista» se traducen en modificaciones del proyecto.
- Multilingüe en italiano, inglés y español, tanto en la entrada de transcripciones como en las instrucciones de chat.
- Ejecución totalmente local en iPhone mediante llama.cpp y Metal (llama.rn), sin conexión a internet tras la descarga.
- No se documenta soporte de tool calling genérico, razonamiento multi-paso fuera del bucle director-crítico, audio ni modo thinking.

## Casos de uso

- Edición automática de vídeo para redes sociales: la aplicación envía la transcripción y varios fotogramas al modelo, que devuelve un plan JSON con títulos y rótulos temporizados; el editor los renderiza sin intervención del usuario y este solo revisa el resultado antes de exportar.
- Generación de rótulos inferiores (lower thirds) a partir del habla: el modelo lee la transcripción, identifica nombres, cargos o precios y propone el texto y el momento exacto de aparición, con un estilo coherente con el resto del proyecto.
- Control de calidad previo a la exportación: el rol de crítico relee el plan y marca gráficos que tapan rostros o se solapan en el tiempo, de modo que la aplicación puede recolocarlos o eliminarlos automáticamente antes de renderizar.
- Edición conversacional en móvil: el usuario dicta o escribe «pon el precio al inicio» y el modelo transforma la instrucción en una modificación concreta del plan, sin necesidad de una interfaz de línea de tiempo compleja.
- Asistencia a creadores sin conocimientos de motion graphics: el modelo elige posiciones y colores legibles analizando los fotogramas, lo que reduce la necesidad de ajustar manualmente la composición.
- Privacidad por diseño en contenido sensible: al ejecutarse íntegramente en el dispositivo, resulta adecuado para clips con material confidencial (entrevistas, datos de clientes) que no deben subirse a servicios en la nube.
- Prototipado de pipelines de gráficos en otros clientes: dado que se distribuye en GGUF, puede probarse fuera de la aplicación con `llama-mtmd-cli` para validar el esquema de salida antes de integrarlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 1,3 GB para el modelo de lenguaje en Q4_K_M más 0,36 GB para el proyector de visión en Q8_0, es decir, en torno a 1,7 GB de pesos, a los que hay que sumar la memoria de la caché KV y del contexto en tiempo de ejecución.
- GPU recomendadas: el caso de uso declarado es iPhone con backend Metal; en escritorio puede ejecutarse con llama.cpp sobre CPU o GPU compatible con Metal/CUDA, aunque no se especifican modelos concretos.
- Cabe holgadamente en GPU de consumo (por ejemplo, cualquier tarjeta con 4 GB o más de VRAM) y en memoria unificada de dispositivos Apple.
- Opciones de despliegue: llama.cpp mediante `llama-mtmd-cli` con `--mmproj`; en la aplicación, llama.rn sobre Metal. No se documenta soporte para vLLM ni TGI, dado el formato GGUF y el tamaño reducido.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| PROMPTCUT IA | 2B | no disponible | Imagen + texto | Apache 2.0 | GGUF (Q4_K_M + mmproj Q8_0) | Afinado para un esquema JSON de edición de vídeo; 0 descargas en Hugging Face |
| Qwen3.5-2B (base) | 2B | no disponible | Según la variante del modelo base | Apache 2.0 | Safetensors y otras | Modelo generalista; PROMPTCUT IA es un LoRA sobre él |
| Alternativas multimodales pequeñas para on-device | no disponible | no disponible | Imagen + texto | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

## Limitaciones y advertencias

- Es un modelo de 2B parámetros: la propia model card advierte que no es un asistente general y que, como chat genérico, se comporta como un Qwen pequeño sin capacidades destacables.
- Puede seleccionar el gráfico equivocado o interpretar mal un fotograma; la aplicación mitiga esto permitiendo al usuario modificar todo antes de exportar.
- Está afinado para los prompts y el esquema de salida propios de PROMPTCUT, por lo que su uso fuera de ese contexto produce resultados degradados.
- No se documentan sesgos conocidos, tasas de alucinación ni evaluaciones de robustez; al ser un ajuste fino sobre datos sintéticos revisados a mano, cabe esperar sesgos heredados del modelo profesor y del base.
- Cobertura lingüística limitada a italiano, inglés y español; no se garantiza un comportamiento correcto en otros idiomas.
- Longitud de contexto no documentada, lo que impide planificar su uso con transcripciones muy largas sin pruebas previas.
- Licencia Apache 2.0: permite uso comercial y modificación, pero exige conservar los avisos de licencia y atribución correspondientes.
- El repositorio no registra descargas ni interacciones, y no hay publicación asociada ni paper; la validación externa es inexistente por el momento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Thomas0202/promptcut-ia
- Modelo base Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Sitio de PROMPTCUT: https://promptcut.co/
- Página del modelo en el sitio del proyecto: https://promptcut.ai/portfolio/the-model/
