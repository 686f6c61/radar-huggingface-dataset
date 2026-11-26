# taobao-mnn/Qwen3-4B-SafeRL-MNN

## Resumen

Qwen3-4B-SafeRL-MNN es la versión cuantizada para el motor de inferencia MNN del modelo Qwen3-4B-SafeRL, un ajuste de alineación de seguridad del Qwen3-4B de Alibaba. El modelo base se entrena mediante aprendizaje por refuerzo usando señales de recompensa proporcionadas por Qwen3Guard-Gen, un clasificador de seguridad de la propia familia Qwen. Este repositorio, publicado por el equipo taobao-mnn, no contiene los pesos originales en safetensors sino una exportación optimizada para ejecución en CPU mediante MNN, combinando cuantización HQQ de 4 bits en las capas lineales del transformer y 8 bits en la cabeza de salida.

El modelo conserva la arquitectura transformer densa del Qwen3-4B original, con 36 capas y una dimensión oculta de 2560, lo que sitúa el total en aproximadamente 4 000 millones de parámetros. La relevancia de esta ficha radica en que ofrece una vía práctica para desplegar un modelo de 4B con alineación de seguridad en hardware sin GPU, algo poco habitual en el ecosistema, ya que la mayoría de distribuciones cuantizadas se orientan a llama.cpp o a formatos GGUF. El formato MNN está pensado para integración en aplicaciones móviles y de escritorio mediante el runtime de Alibaba.

El repositorio ocupa 5,2 GB e incluye el grafo del modelo (`llm.mnn`), los pesos (`llm.mnn.weight`), el tokenizador (`tokenizer.mtok`) y los ficheros de configuración. La licencia es Apache 2.0, heredada del modelo base, y los idiomas declarados son chino e inglés. Su perfil de uso es el de un modelo de generación de texto para asistentes y aplicaciones con requisitos de seguridad, ejecutado en CPU con precisión baja y consumo de memoria reducido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-4B), exportado a MNN |
| Parametros totales | ~4 000 millones (modelo base Qwen3-4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | HQQ 4 bits (grupo 64) en capas lineales; HQQ 8 bits (grupo 64) en cabeza de salida; escalas en FP16; embeddings compartidos con la cabeza en 8 bits |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | MNN (`llm.mnn`, `llm.mnn.weight`), tokenizador `tokenizer.mtok` |

## Arquitectura y entrenamiento

El modelo base Qwen3-4B-SafeRL parte de la arquitectura transformer densa de Qwen3-4B: 36 capas, dimensión oculta de 2560 y atención multi-cabeza estándar. Sobre ese modelo se aplica un proceso de aprendizaje por refuerzo cuyo reward model es Qwen3Guard-Gen, un clasificador generativo de seguridad de la familia Qwen. El objetivo es reducir respuestas dañinas o inseguras manteniendo la capacidad general del modelo. No se dispone en la información proporcionada del número de tokens de entrenamiento, la composición del dataset de RL ni los hiperparámetros del proceso.

La exportación a MNN sustituye las capas lineales por versiones cuantizadas con HQQ (Half-Quadratic Quantization) a 4 bits con grupo de 64, mientras que la cabeza de salida y los embeddings compartidos se mantienen a 8 bits. Las escalas de cuantización se almacenan en FP16. El resultado es un paquete autocontenido que el runtime MNN ejecuta en CPU con cuatro hilos por defecto, en modo `precision=low` y `memory=low`. La verificación publicada por el autor (12 de noviembre de 2026, x64 CPU) cubre alineación de mapeo FP32, saludos, aritmética, traducción y una prueba de humo con la configuración por defecto. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en chino e inglés.
- Razonamiento y aritmética básica, verificado en las pruebas de exportación del autor.
- Traducción entre los idiomas soportados, también verificada en las pruebas de exportación.
- Alineación de seguridad reforzada mediante RL con Qwen3Guard-Gen como reward model.
- Ejecución en CPU sin GPU mediante el runtime MNN.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles (modelo solo de texto).

## Casos de uso

- Asistentes conversacionales en aplicaciones de escritorio o móviles: el paquete MNN está diseñado para integrarse en apps mediante el runtime de Alibaba, de modo que un asistente con alineación de seguridad puede ejecutarse localmente en CPU sin depender de servicios en la nube.
- Moderación y generación de respuestas seguras en entornos con requisitos de cumplimiento: el ajuste con Qwen3Guard-Gen reduce la probabilidad de respuestas dañinas, lo que resulta adecuado para chatbots orientados al usuario final en productos de consumo.
- Traducción automática ligera chino-inglés: las pruebas del autor incluyen casos de traducción, y el tamaño de 4B con cuantización de 4 bits permite desplegarlo en equipos modestos.
- Procesamiento por lotes en servidores sin GPU: al ejecutarse en CPU con MNN, puede integrarse en pipelines de preprocesado o generación de contenido donde no hay aceleradores disponibles.
- Prototipado e investigación sobre alineación de seguridad: al estar basado en Qwen3-4B-SafeRL, sirve para evaluar el efecto del RL con rewards de seguridad en un modelo pequeño y desplegable localmente.
- Aplicaciones embebidas y de borde: el formato MNN y la configuración de baja memoria están pensados para dispositivos con recursos limitados, donde otros formatos cuantizados resultan menos prácticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el modo previsto (CPU); el repositorio ocupa 5,2 GB en disco y la ejecución usa cuantización de 4/8 bits con `memory=low`.
- GPU recomendadas: no disponible; el autor valida la ejecución en CPU x64.
- Compatibilidad con GPU de consumo: no documentada en la información proporcionada.
- Opciones de despliegue: runtime MNN (compilación con `MNN_BUILD_LLM=ON`, `MNN_LOW_MEMORY=ON`, `MNN_SUPPORT_TRANSFORMER_FUSE=ON`) mediante el binario `llm_demo`; verificado con MNN 3.6.2 en el commit `b0239771b07b317a258fbc384683bbd540741406`.
- Configuración por defecto: CPU, 4 hilos, `precision=low`, `memory=low`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-4B-SafeRL-MNN | ~4B | no disponible | MNN, CPU | Apache 2.0 | Versión cuantizada HQQ 4/8 bits; alineación de seguridad con Qwen3Guard-Gen |
| Qwen3-4B-SafeRL (base) | ~4B | no disponible | safetensors (Hugging Face) | Apache 2.0 | Modelo original sin cuantizar; requiere framework estándar (transformers, vLLM) |
| Qwen3-4B | ~4B | no disponible | safetensors, GGUF en la familia Qwen | Apache 2.0 | Modelo base sin el ajuste de seguridad específico |
| Otras distribuciones cuantizadas de Qwen3-4B (GGUF/llama.cpp) | ~4B | no disponible | GGUF | Apache 2.0 | Orientadas a llama.cpp/Ollama; no comparables directamente en formato con MNN |

## Limitaciones y advertencias

- Solo se declaran chino e inglés; el rendimiento en castellano no está verificado y probablemente sea inferior.
- El ajuste de seguridad reduce pero no elimina el riesgo de respuestas dañinas o alucinaciones; no debe usarse como único mecanismo de moderación en producción.
- La cuantización HQQ a 4 bits introduce pérdida de precisión respecto al modelo original; el autor solo valida pruebas de humo, no evaluaciones exhaustivas de calidad.
- La longitud de contexto no se especifica en la información proporcionada; conviene consultar `llm_config.json` antes de asumir la ventana del Qwen3-4B original.
- El formato MNN limita la portabilidad: no es compatible directamente con vLLM, TGI, llama.cpp ni Ollama, y requiere compilar el runtime MNN.
- La licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen3-4B-SafeRL; conviene revisar la licencia upstream.
- El repositorio tiene muy pocas descargas (247) y ningún "like", lo que indica escasa validación por parte de la comunidad.
- No hay información sobre sesgos específicos del ajuste de seguridad ni sobre su comportamiento en dominios sensibles.

## Enlaces

- Hugging Face: https://huggingface.co/taobao-mnn/Qwen3-4B-SafeRL-MNN
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-SafeRL
- ModelScope: https://modelscope.cn/models/MNN/Qwen3-4B-SafeRL-MNN
- Repositorio MNN: https://github.com/alibaba/MNN
- Documentación MNN-LLM: https://mnn-docs.readthedocs.io/en/latest/transformers/llm.html
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-4B-SafeRL/blob/main/LICENSE
