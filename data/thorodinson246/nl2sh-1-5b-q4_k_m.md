# ThorOdinson246/nl2sh-1.5b-Q4_K_M

## Resumen

nl2sh-1.5b-Q4_K_M es un modelo de generación de comandos shell a partir de lenguaje natural, desarrollado por ThorOdinson246 como parte del proyecto nl2sh. Se trata de un fine-tune LoRA sobre Qwen2.5-Coder-1.5B-Instruct, fusionado en los pesos base y cuantizado a GGUF Q4_K_M, lo que resulta en un archivo de 941 MB que ejecuta en CPU mediante llama.cpp sin necesidad de GPU. El modelo responde en aproximadamente un segundo y está diseñado para emitir una única línea de comando POSIX/bash, sin prosa ni explicaciones.

El modelo resuelve el problema de traducir peticiones en inglés a comandos shell correctos, un caso de uso frecuente en administración de sistemas y desarrollo. Su relevancia radica en que, pese a su tamaño reducido, alcanza una tasa de acierto del 0.620 en el benchmark InterCode-ALFA, superando al modelo base sin tunear (0.540) y siendo estadísticamente indistinguible de un Qwen2.5-Coder-7B-Instruct sin tunear (0.613), con una diferencia de solo 0.007 puntos. La licencia Apache-2.0 permite uso comercial sin restricciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5-Coder-1.5B-Instruct) con LoRA fusionada |
| Parametros totales | 1.5B (aproximadamente, heredados del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-Coder-1.5B-Instruct soporta 32K tokens, pero no se especifica en la ficha) |
| Tipos de cuantizacion | Q4_K_M (único formato publicado) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-1.5B-Instruct, un transformer decoder-only de 1.5B parámetros con ventana de contexto de 32K tokens. Sobre esta base se aplicó un fine-tune LoRA con r=32 y α=64, entrenado sobre 125.770 pares instrucción-comando en inglés. Los pesos LoRA se fusionaron con los pesos base y el resultado se cuantizó a GGUF Q4_K_M para su ejecución eficiente en CPU.

El dataset de entrenamiento combina seis fuentes, medidas por fila: Fig autocomplete specs (32,8%, MIT), tldr-pages (23,1%, CC-BY-4.0), NL2SH-ALFA training split (18,0%, MIT), cli-commands-explained (11,8%, CC0-1.0 declarado), command-generation (7,3%, Apache-2.0 declarado) y git-instruction (7,1%, MIT declarado). El 5,67% del total proviene de NL2Bash vía el split ALFA, cuyo corpus de datos está licenciado MIT aunque el código sea GPL-3.0. El dataset fue deduplicado y auditado contra el benchmark de evaluación, con 0 coincidencias exactas y 0 difusas (token-Jaccard ≥ 0,7) sobre las 300 consultas de test y 600 comandos dorados.

No se menciona el uso de RLHF, DPO ni otras técnicas de alineación. El entrenamiento se centra en la generación de comandos con formato estricto: una sola línea, sin markdown ni explicaciones.

## Capacidades

- Generación de comandos shell POSIX/bash a partir de instrucciones en inglés, con salida limitada a 64 tokens (una línea, no scripts).
- Ejecución en CPU mediante llama.cpp, sin necesidad de GPU, con latencia de aproximadamente 1 segundo.
- Decodificación greedy a temperatura 0, lo que garantiza que la misma petición produce siempre el mismo comando.
- Soporte de system prompt específico para forzar el formato de salida.
- Integración con la CLI nl2sh, que añade una denylist de patrones destructivos y confirmación manual.
- No soporta tool calling, agentes, visión, audio ni razonamiento multi-paso. Es estrictamente single-turn y no tiene memoria de conversaciones previas.

## Casos de uso

- Asistente de terminal local: el modelo se integra en la CLI nl2sh para que un usuario escriba peticiones en lenguaje natural ("comprime esta carpeta en un tar.gz") y reciba el comando exacto listo para ejecutar. Su tamaño de 941 MB permite ejecutarlo en cualquier portátil sin GPU.
- Automatización de tareas de administración de sistemas: administradores que gestionan servidores remotos pueden generar comandos de gestión de procesos, permisos o almacenamiento sin memorizar sintaxis complejas, reduciendo errores de tipeo.
- Generación de comandos para pipelines de CI/CD: en entornos de integración continua, el modelo puede producir comandos de build, test o despliegue a partir de descripciones en inglés, integrándose en scripts de automatización.
- Formación y documentación de shell: desarrolladores junior o estudiantes pueden consultar el modelo para aprender la sintaxis correcta de comandos como `find`, `grep` o `tar`, obteniendo ejemplos ejecutables.
- Accesibilidad para usuarios no técnicos: personas sin experiencia en línea de comandos pueden describir tareas cotidianas (buscar archivos, cambiar permisos) y obtener el comando adecuado, facilitando el uso de entornos Unix.
- Herramientas de productividad para desarrolladores: integración en editores de código o plugins de terminal que ofrecen sugerencias de comandos basadas en la descripción de la tarea, acelerando el flujo de trabajo diario.

## Benchmarks y rendimiento

El modelo fue evaluado en InterCode-ALFA, un benchmark que ejecuta los comandos generados en un contenedor y compara el sistema de archivos resultante, el contenido de los archivos y la salida estándar contra una referencia. Una tarea se considera superada solo si hay coincidencia exacta, sobre 300 tareas. Los resultados se obtuvieron con el scorer oficial sin modificar, a temperatura 0 y con un presupuesto de 64 tokens.

| Modelo | Tamano | Tasa de acierto |
|---|---|---|
| GPT-4o (API en la nube, cifra publicada por los autores del benchmark) | — | 0.73 |
| **nl2sh-1.5b-Q4_K_M** | **941 MB** | **0.620** |
| Qwen2.5-Coder-7B-Instruct, sin tunear | 4.4 GB | 0.613 |
| Qwen2.5-Coder-1.5B-Instruct, sin tunear (base de este modelo) | 941 MB | 0.540 |

El fine-tune aporta una ganancia pareada de +0.080 sobre la base (p = 0.004, test exacto de McNemar). La diferencia con el 7B sin tunear es de 0.007 puntos con un intervalo de confianza del 95% de [−0.050, +0.063] y p = 0.91, lo que indica que no hay diferencia estadísticamente significativa, aunque el tamaño muestral de 300 tareas solo permite descartar gaps superiores a unos 5 puntos. GPT-4o mantiene una ventaja de aproximadamente 11 puntos.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo se ejecuta íntegramente en CPU.
- RAM: aproximadamente 1 GB para cargar el modelo en memoria (941 MB de pesos más overhead de llama.cpp).
- CPU: cualquier procesador moderno de 64 bits; el rendimiento escala con el número de hilos. En un portátil estándar, la generación de un comando tarda alrededor de 1 segundo.
- GPU: no necesaria, aunque si se dispone de una, llama.cpp puede usarla para acelerar la inferencia.
- Opciones de despliegue: llama.cpp (llama-cli), la CLI nl2sh, o cualquier runtime compatible con GGUF (Ollama, llama-cpp-python, etc.).
- Latencia: aproximadamente 1 segundo por petición en CPU con decodificación greedy y 64 tokens de salida máxima.
- Throughput: no publicado, pero al ser un modelo de 1.5B cuantizado, es adecuado para uso interactivo local con un solo usuario.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tasa de acierto (InterCode-ALFA) | Licencia | Formato |
|---|---|---|---|---|---|
| **nl2sh-1.5b-Q4_K_M** | 1.5B | no disponible (base: 32K) | 0.620 | Apache-2.0 | GGUF Q4_K_M |
| Qwen2.5-Coder-1.5B-Instruct (sin tunear) | 1.5B | 32K | 0.540 | Apache-2.0 | safetensors, GGUF |
| Qwen2.5-Coder-7B-Instruct (sin tunear) | 7B | 32K | 0.613 | Apache-2.0 | safetensors, GGUF |
| GPT-4o (API) | no publicado | no publicado | 0.73 | propietaria | API |

La comparativa muestra que el fine-tune específico para shell permite a un modelo de 1.5B igualar el rendimiento de un 7B sin tunear, con un coste de hardware mucho menor. GPT-4o sigue siendo superior, pero requiere conexión a API y no es ejecutable localmente.

## Limitaciones y advertencias

- Riesgo de comandos destructivos: el modelo genera comandos que pueden borrar o corromper datos si se ejecutan. En una evaluación con prompts adversariales, dos anotadores independientes juzgaron que el 11,0% de las salidas (IC 95%: [6,8%, 17,5%]) eran comandos que destruirían o corromperían datos no solicitados; en prompts cotidianos la tasa fue del 2,0% (IC: [0,7%, 5,7%]). La CLI nl2sh incluye una denylist y nunca ejecuta automáticamente comandos marcados, pero no es un sandbox.
- Single-turn: no hay estado de shell ni memoria de comandos anteriores. Cada petición se trata de forma independiente.
- Sin acceso al sistema de archivos: el modelo no puede ver el contenido del disco, por lo que peticiones que dependen de archivos reales ("borra la copia de seguridad más antigua") pueden producir comandos incorrectos.
- Salida limitada a 64 tokens: genera un comando, no un script. No es adecuado para tareas que requieran múltiples pasos o lógica condicional.
- Evaluación limitada: solo se ha probado en un benchmark de 300 tareas en inglés. No hay evidencia de rendimiento en otros idiomas ni en tareas fuera del dominio shell.
- Sesgo de entrenamiento: los datos provienen de fuentes de documentación y autocompletado, lo que puede sesgar hacia comandos comunes y sintaxis estándar, con menor cobertura de herramientas menos populares.
- Licencias de datos: tres fuentes (cli-commands-explained, command-generation, git-instruction) tienen licencias declaradas pero no verificadas de forma independiente. Aunque la licencia del modelo es Apache-2.0, los datos de entrenamiento podrían tener restricciones adicionales.
- Alucinación: como todo modelo generativo, puede producir comandos sintácticamente válidos pero semánticamente incorrectos o inexistentes, especialmente con peticiones ambiguas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ThorOdinson246/nl2sh-1.5b-Q4_K_M
- Repositorio del proyecto nl2sh: https://github.com/ThorOdinson246/nl2sh
- Repositorio whatisit-nl2sh (documentación adicional): https://github.com/ThorOdinson246/whatisit-nl2sh
- Artículo técnico sobre el entrenamiento: https://bittide.aicompass.dev/article/3b8a77fd-8811-4532-830e-c91ef980bc4c
- Benchmark InterCode-ALFA: https://github.com/westenfelder/InterCode-ALFA
- Modelo base Qwen2.5-Coder-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
