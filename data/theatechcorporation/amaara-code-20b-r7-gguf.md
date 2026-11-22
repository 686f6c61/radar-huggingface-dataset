# theatechcorporation/amaara-code-20b-r7-GGUF

## Resumen

Amaara Code 20B r7 es un ajuste fino (fine-tune) orientado a agentes de programación sobre el modelo abierto de OpenAI `gpt-oss-20b`, publicado por theatechcorporation bajo el identificador `theatechcorporation/amaara-code-20b-r7-GGUF`. Se distribuye exclusivamente en formato GGUF cuantizado, con un total de 20.914.757.184 parámetros (aproximadamente 21B) y una arquitectura MoE con unos 3.6B parámetros activos por token. El modelo está etiquetado como `coding-agent` y `function-calling`, lo que indica un foco en tareas de edición de código, invocación de herramientas y razonamiento multi-paso.

El modelo se presenta explícitamente como una **release experimental** destinada a evaluación, no a producción. Su entrenamiento se basa en un corpus canónico de conversaciones compartido entre todas las variantes de la familia Amaara Code, con selección de trayectorias por forma: se conservan las trazas verificadas de tipo edición→test→éxito y las de autocorrección, mientras que se descartan las ediciones no verificadas.

La relevancia actual reside en que reutiliza el tokenizador y la plantilla Harmony de `gpt-oss-20b`, lo que facilita su integración en pipelines existentes construidos para el modelo base de OpenAI, y en que ofrece cuantizaciones GGUF listas para desplegar en hardware de consumo. La licencia combina la Apache-2.0 del upstream de OpenAI con una licencia propia adicional (A-TECH Model Licence).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (derivada de openai/gpt-oss-20b) |
| Parametros totales | 20.914.757.184 (~21B) |
| Parametros activos | ~3.6B (MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF cuantizado (Q8_0 como referencia de fidelidad; niveles inferiores no detallados) |
| Idiomas soportados | no disponible |
| Licencia | A-TECH Model Licence + Apache-2.0 upstream (openai/gpt-oss-20b) |
| Formato de pesos | GGUF (repo de 77.2 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de mezcla de expertos (MoE) de `gpt-oss-20b`: aproximadamente 21B parámetros totales con unos 3.6B activos por token, lo que permite un coste de inferencia por token mucho menor que un modelo denso del mismo tamaño. Utiliza la plantilla de chat Harmony, propia de la familia gpt-oss, lo que condiciona el formato de las conversaciones y de las llamadas a herramientas.

El ajuste fino se realizó sobre un corpus canónico de conversaciones compartido por toda la familia Amaara Code. La selección de datos se hizo por **forma de trayectoria**: se retienen las trazas verificadas de edición→test→éxito y las de autocorrección, se descartan las trazas de edición sin verificación y las trazas largas se recortan en ventana alrededor del tramo final de edición y verificación en lugar de eliminarse. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO. El autor advierte que gpt-oss mantiene un número elevado de tensores en F32, por lo que los ficheros GGUF resultan mayores de lo que el nombre de la cuantización sugiere.

## Capacidades

- Generación de código y edición de ficheros dentro de flujos de agente (edit→test→pass).
- Autocorrección de errores: el corpus de entrenamiento incluye trazas de self-correction verificadas.
- Function calling / tool calling, con etiquetas explícitas `function-calling` y `coding-agent`.
- Razonamiento multi-paso orientado a agentes de programación (ejecución de comandos, lectura de resultados, nueva edición).
- Compatibilidad con la plantilla Harmony de gpt-oss, lo que facilita su uso con harnesses ya adaptados a ese formato.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Agente de reparación de bugs en CI: el modelo puede recibir un fallo de test, localizar el fichero afectado, proponer una edición y volver a ejecutar la suite, aprovechando las trazas edit→test→pass con las que fue entrenado.
- Automatización de tareas de refactorización acotadas: dado un objetivo concreto (renombrar una API, migrar una firma), el modelo invoca herramientas de búsqueda y edición de forma iterativa.
- Asistente de terminal con function calling: integrado en un CLI tipo A-Coder-CLI, traduce instrucciones en lenguaje natural a secuencias de comandos y ediciones verificables.
- Generación de parches en revisión de código: propone diffs sobre ficheros concretos y permite que el harness valide el resultado antes de aceptarlo.
- Evaluación comparativa de cuantizaciones: al publicarse varios niveles GGUF, sirve para medir la degradación de precisión entre Q8_0 y cuantizaciones menores en tareas de código.
- Entorno de investigación sobre agentes de código: al ser una release experimental con corpus documentado, es útil para estudiar el efecto de la selección de trayectorias en el comportamiento del agente.

## Benchmarks y rendimiento

El autor indica que la evaluación se realizó con A-Coder-CLI sobre una suite de 20 tareas derivada de SWE-bench usando el harness del proyecto, y afirma explícitamente que no declara ninguna puntuación no medida. En la información disponible no se incluyen los resultados numéricos de esa evaluación.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: depende de la cuantización elegida; el repo completo ocupa 77.2 GB, por lo que Q8_0 requiere del orden de esa cifra y las cuantizaciones inferiores reducen el requisito, aunque los tensores F32 de gpt-oss mantienen el tamaño por encima de lo habitual para el nombre del quant.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, un modelo de ~21B en Q8_0 no cabe en GPU de consumo de 24 GB y requiere aceleradores de mayor memoria o reparto entre GPU y CPU.
- GPU de consumo: viable solo con cuantizaciones bajas y descarga parcial a RAM/CPU; no se especifican niveles concretos ni cifras de VRAM por quant.
- Opciones de despliegue: llama.cpp y Ollama son las vías naturales para GGUF; vLLM y TGI no se mencionan en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Formato | Licencia |
|---|---|---|---|---|---|
| Amaara Code 20B r7 | ~21B | ~3.6B | no disponible | GGUF | A-TECH + Apache-2.0 |
| openai/gpt-oss-20b (base) | ~21B | ~3.6B | no disponible | safetensors y derivados | Apache-2.0 |
| Otras variantes Amaara Code (4B, Flash) | 4B / no disponible | no disponible | no disponible | no disponible | A-TECH + upstream |

La comparación directa con el modelo base es la más informativa: Amaara Code 20B r7 añade un ajuste fino específico para agentes de código y una licencia adicional, manteniendo la arquitectura MoE y la plantilla Harmony de `gpt-oss-20b`. No se dispone de datos de rendimiento comparativos entre ambas variantes en la información proporcionada.

## Limitaciones y advertencias

- Release experimental: el autor indica explícitamente que no debe usarse en producción hasta que se publiquen las versiones oficiales.
- Licencia compuesta: la A-TECH Model Licence se aplica además de la Apache-2.0 de OpenAI; es necesario revisar ambos textos antes de cualquier uso comercial. El autor señala que el umbral de ingresos no bloquea los pesos.
- Riesgo de alucinación: no se documenta ninguna mitigación específica ni tasas medidas.
- Idiomas soportados: no disponibles; no se puede garantizar un comportamiento adecuado fuera del inglés sin evaluación previa.
- Longitud de contexto: no disponible, lo que impide planificar tareas de agente con repositorios grandes.
- Sesgos: no documentados en la información disponible.
- Sin métricas publicadas: la evaluación se describe metodológicamente pero no se acompañan cifras, lo que limita la comparación objetiva.
- Cero descargas y cero likes en el momento de la consulta: ecosistema de validación externa inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/theatechcorporation/amaara-code-20b-r7-GGUF
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
- Licencia A-TECH: https://github.com/hamishfromatech/a-tech-license/blob/main/A-TECH-MODEL-LICENSE.md
- Harness de evaluación A-Coder-CLI: https://github.com/hamishfromatech/a-coder-cli
- Comunidad AI Owner's Club: https://www.skool.com/open-source-ai-builders-club/about
