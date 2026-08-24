# STUPIDATHENA/MiniCPM5-1B

## Resumen

MiniCPM5-1B es un modelo de lenguaje denso de 1.000 millones de parámetros desarrollado por OpenBMB, orientado a despliegue en dispositivos locales y escenarios con recursos limitados. La subida de STUPIDATHENA en Hugging Face es una copia del modelo original, pero su model card está vacía y no aporta información técnica adicional. Los datos técnicos de esta ficha provienen de la documentación oficial de OpenBMB y de análisis externos.

El modelo destaca por alcanzar el estado del arte en la categoría de 1B según OpenBMB, con una puntuación media de 42,57 en un conjunto de benchmarks que cubren razonamiento, conocimiento, código, instrucciones, matemáticas, lógica y tareas de agente. Incluye soporte nativo de contexto largo y modos de chat "Think" y "No Think" desde un mismo checkpoint, lo que lo hace versátil para asistentes locales y herramientas de agente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso |
| Parametros totales | 1.000 millones (1B) |
| Parametros activos | no disponible (modelo denso) |
| Longitud de contexto | no disponible (se menciona "native long-context support" pero sin cifra concreta) |
| Tipos de cuantizacion | no disponible (se espera compatibilidad con GGUF, pero no se confirma) |
| Idiomas soportados | no disponible (probablemente multilingüe, pero sin confirmar) |
| Licencia | no disponible en la subida de STUPIDATHENA; la licencia del modelo original no se indica en la documentación encontrada |
| Formato de pesos | safetensors (según los tags de la subida) |

## Arquitectura y entrenamiento

El modelo es un Transformer denso, sin mezcla de expertos, diseñado para ser eficiente en memoria y cómputo. No se han publicado detalles sobre el proceso de entrenamiento (número de tokens, composición del dataset, métodos de alineación como RLHF o DPO) en la información disponible. La documentación oficial de OpenBMB indica que es el primer modelo de la serie MiniCPM5, con un enfoque en despliegue local y uso en escenarios de recursos limitados.

## Capacidades

- Generación de texto y razonamiento de propósito general.
- Soporte de tool calling y function calling para integración con herramientas externas.
- Capacidad para tareas de agente y razonamiento multi-paso.
- Modo "Think" y "No Think" para controlar el nivel de razonamiento explícito.
- Soporte de contexto largo nativo (sin especificar la longitud exacta).
- Adecuado para generación de código y asistentes de programación.

## Casos de uso

- Asistentes personales locales: el modelo puede ejecutarse en un ordenador personal o dispositivo móvil sin conexión, gestionando conversaciones multi-turno y tareas de calendario, recordatorios o búsqueda de información.
- Generación de código en entornos de desarrollo: gracias a su soporte de tool calling, puede integrarse en editores de código para autocompletar, explicar o refactorizar fragmentos, funcionando incluso sin conexión.
- Agentes de automatización de tareas: en un entorno de servidor, puede actuar como agente que llama a APIs externas, ejecuta comandos o planifica secuencias de acciones, con el modo "Think" para razonar antes de actuar.
- Chatbots de atención al cliente en entornos con privacidad estricta: al ser desplegable localmente, no envía datos a la nube, adecuado para empresas que manejan información confidencial.
- Procesamiento de documentos con contexto largo: la ventana de contexto amplia permite resumir o extraer información de informes extensos, aunque no se conoce la longitud máxima exacta.
- Prototipado rápido de aplicaciones de IA: su pequeño tamaño permite iterar en entornos de desarrollo sin necesidad de GPUs potentes, reduciendo costes de experimentación.

## Benchmarks y rendimiento

Según la documentación de OpenBMB, MiniCPM5-1B alcanza una puntuación media de 42,57 en un conjunto de benchmarks que incluyen razonamiento, conocimiento, código, instrucciones, matemáticas, lógica y tareas de agente. No se han publicado resultados desglosados por benchmark específico en la información disponible. La comparativa con otros modelos de la misma categoría no se detalla en las fuentes consultadas.

## Requisitos de hardware

- VRAM estimada: con 1B de parámetros, la inferencia en FP16 requiere aproximadamente 2 GB de VRAM; con cuantización a 8 bits puede caber en 1 GB, y en 4 bits en menos de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, o incluso una RTX 4090 para mayor velocidad). También puede ejecutarse en CPU, aunque con mayor latencia.
- Es viable en hardware de consumo: sí, es un modelo diseñado para ejecutarse en dispositivos con recursos limitados.
- Opciones de despliegue: es compatible con la librería `transformers` de Hugging Face; para despliegue en producción se pueden usar vLLM, llama.cpp, Ollama (se ha publicado en Ollama como `openbmb/minicpm5`) o TGI.
- Latencia y throughput: no se dispone de mediciones oficiales; se espera que en una GPU moderna de gama media (RTX 3060) genere decenas de tokens por segundo, pero no hay datos concretos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Puntuación media (benchmark) |
|---|---|---|---|---|
| MiniCPM5-1B | 1B | no disponible | no disponible | 42,57 |
| Qwen2.5-1.5B | 1,5B | 128K | Apache 2.0 | ~50 (estimado) |
| Phi-3.5-mini | 3,8B | 128K | MIT | ~55 (estimado) |
| Llama-3.2-1B | 1,2B | 128K | Meta Llama | ~40 (estimado) |

Los valores de los modelos comparados son orientativos y provienen de evaluaciones públicas, no de una comparación directa con MiniCPM5-1B. No se dispone de una comparativa oficial con estos modelos.

## Limitaciones y advertencias

- La subida de STUPIDATHENA carece de documentación técnica y de una model card completa; se recomienda consultar el repositorio oficial de OpenBMB para obtener información verificada.
- No se conocen los sesgos específicos del modelo, pero como modelo de lenguaje, puede generar contenido inexacto, sesgado o inapropiado en ciertos contextos.
- Riesgo de alucinación: es inherente a todos los modelos generativos; la información generada debe revisarse antes de usarse en entornos de alto riesgo.
- La licencia no está especificada en la subida, por lo que el uso comercial puede ser ambiguo; se recomienda verificar la licencia del modelo original en el repositorio de OpenBMB.
- La longitud del contexto no se ha detallado; aunque se menciona soporte de contexto largo, se desconoce el límite real, lo que puede afectar a aplicaciones que requieran ventanas muy extensas.
- No se han publicado resultados de benchmarks desglosados, por lo que la puntuación media debe interpretarse con cautela.

## Enlaces

- Subida de STUPIDATHENA en Hugging Face: https://huggingface.co/STUPIDATHENA/MiniCPM5-1B
- Modelo original de OpenBMB: https://huggingface.co/openbmb/MiniCPM5-1B
- Repositorio GitHub de OpenBMB: https://github.com/OpenBMB/MiniCPM
- Página en Ollama: https://ollama.com/openbmb/minicpm5
- Análisis en Artificial Analysis: https://artificialanalysis.ai/models/minicpm5-1b
