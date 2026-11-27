# win10kimo/Gemma-4-12B-Gemini-3.5-FlashLite-Distill

## Resumen

Gemma-4-12B-Gemini-3.5-FlashLite-Distill es un ajuste fino experimental del modelo google/gemma-4-12B-it, publicado por el usuario win10kimo en Hugging Face. Se trata de un QLoRA (r=32, lora_alpha=64) entrenado sobre 5.990 trayectorias sinteticas destiladas del modelo profesor Gemini 3.5 Flash-Lite, orientado a tareas de scripting de linea de comandos, administracion basica de Windows y Linux (PowerShell, VBScript, Batch) y llamadas de herramienta de shell en un solo turno.

El modelo conserva el formato nativo de razonamiento de Gemma 4 mediante el canal `<|channel>thought` y la compatibilidad multimodal a traves del proyector `mmproj`, lo que permite entrada de imagen y texto. Se distribuye principalmente en formato GGUF con tres cuantizaciones (Q5_K_M, Q4_K_M y Q3_K_S), ademas de los adaptadores LoRA en bfloat16, y esta pensado para su uso local en LM Studio, Atomic Chat y llama.cpp.

Es relevante ahora como ejemplo de destilacion de un modelo profesor propietario y rapido hacia un modelo abierto de ~12B para tareas de agente CLI. No obstante, el propio autor marca el repositorio como archivado y defectuoso por un error en el entrenamiento, y lo declara superado por un ajuste posterior de Gemma 4 E4B, por lo que debe considerarse unicamente como referencia tecnica y no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basada en google/gemma-4-12B-it; ajuste QLoRA sobre proyecciones de atencion y MLP |
| Parametros totales | 11.907.350.576 (~11,9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q5_K_M (5 bits), Q4_K_M (4 bits), Q3_K_S (3 bits); LoRA en bfloat16; proyector mmproj en BF16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones y mmproj) y adaptadores LoRA PEFT/Unsloth en bfloat16 |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-12B-it, un transformer multimodal con capacidad de entrada de imagen y texto, y aplica un ajuste QLoRA de rango 32 y alpha 64 con dropout 0 sobre todas las proyecciones lineales de atencion y MLP, lo que supone 131,1 millones de parametros entrenables (1,08% del total). El entrenamiento se realizo en una NVIDIA L4 de 24 GB en bfloat16, con 2 epocas (1.468 pasos), programacion coseno con LR 2e-4, optimizador adamw_8bit y tamano de lote efectivo de 8.

El dataset consta de 5.990 trayectorias sinteticas de un solo turno generadas por el profesor Gemini 3.5 Flash-Lite: 4.941 soluciones directas de CLI y codigo, y 1.049 trayectorias de llamada de herramienta `run_shell` en formato nativo `<|tool_call>call:run_shell{...}<tool_call|>`. Se aplico enmascaramiento de perdida (`train_on_responses_only`), de modo que la perdida se calculo exclusivamente sobre los trazos de razonamiento `<|channel>thought`, las respuestas y la sintaxis de llamada de herramienta, sin desperdiciar perdida en los prompts del usuario. La perdida de validacion (split retenido del 2%) descendio de 0,6751 en el paso 150 a 0,5904 en el paso 1350.

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento nativo mediante `<|channel>thought`.
- Generacion de codigo y scripts: PowerShell, VBScript (`.vbs`), Batch (`.bat`), bash, Git, SQL (sqlite3/psql) y sistemas de build (make, cmake, pytest, npm, Docker, C/C++/Rust/Python/Node).
- Llamada de herramienta de shell en un solo turno con el formato `<|tool_call>call:run_shell{...}<tool_call|>`, emitiendo primero un comando de inspeccion cuando se le pregunta por archivos o logs locales.
- Entrada multimodal de imagen y texto gracias al proyector `mmproj` en BF16.
- Administracion basica de Windows y Linux: comprobacion de procesos y servicios, copias de seguridad con robocopy, consultas basicas de WMI y registro.
- Soporte de agentes de un solo paso (no multi-turno complejo, segun las limitaciones declaradas por el autor).
- Capacidades multilingues: no disponibles.

## Casos de uso

- Asistencia en scripting de Windows: el modelo genera comandos de PowerShell y Batch para tareas cotidianas como copias de seguridad con robocopy, recorrido de archivos con `for /f` o consultas de estado de servicios, aprovechando el entrenamiento especifico sobre estas herramientas.
- Automatizacion de tareas de administracion de sistemas: dado un objetivo como comprobar procesos o leer logs, el modelo emite una llamada `run_shell` con el comando de inspeccion adecuado, lo que permite integrarlo en agentes de terminal.
- Generacion de scripts VBScript heredados: util para mantener entornos Windows antiguos que aun dependen de `.vbs` con `WScript.Shell`, `Scripting.FileSystemObject` o consultas WMI basicas.
- Depuracion de pipelines de build: el modelo puede proponer correcciones para errores de `make`, `cmake`, `pytest` o `npm` en flujos de integracion continua, aunque con la advertencia de que el autor recomienda Q4_K_M y modo de pensamiento activado para reducir errores de sintaxis.
- Asistencia local en estaciones de trabajo con GPU de consumo: al caber en 6-12 GB de VRAM segun cuantizacion, puede desplegarse en LM Studio o llama.cpp para tareas de scripting sin enviar datos a la nube.
- Prototipado de agentes CLI con vision: la combinacion de entrada de imagen (capturas de terminal) y llamadas `run_shell` permite experimentar con agentes que interpretan capturas de pantalla y proponen comandos.
- Referencia para destilacion: sirve como caso de estudio de destilacion de un profesor propietario hacia un modelo abierto de ~12B con Unsloth y enmascaramiento de perdida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica de rendimiento reportada es la progresion de perdida de validacion durante el entrenamiento:

| Paso | Epoca | Perdida de entrenamiento | Perdida de validacion |
|---|---|---|---|
| 150 | 0,20 | 0,7088 | 0,6751 |
| 300 | 0,41 | 0,6582 | 0,6608 |
| 450 | 0,61 | 0,6282 | 0,6396 |
| 600 | 0,82 | 0,6309 | 0,6244 |
| 750 | 1,02 | 0,5093 | 0,6142 |
| 900 | 1,23 | 0,5069 | 0,6072 |
| 1050 | 1,43 | 0,4617 | 0,6047 |
| 1200 | 1,63 | 0,4845 | 0,5941 |
| 1350 | 1,84 | 0,4715 | 0,5904 |

## Requisitos de hardware

- VRAM estimada para inferencia: Q3_K_S (~5,15 GB) cabe en GPUs de 6 GB; Q4_K_M (~6,87 GB) en GPUs de 8-12 GB; Q5_K_M (~7,96 GB) requiere 12 GB o mas de VRAM, o 32 GB o mas de RAM en CPU.
- El proyector multimodal `mmproj-gemma-4-12b-it-BF16.gguf` ocupa 167 MB adicionales y debe colocarse en la misma carpeta que el `.gguf` del modelo.
- GPU recomendadas: el autor entreno en una NVIDIA L4 de 24 GB; para inferencia se recomiendan GPUs consumer de 8-12 GB (por ejemplo, RTX 3060 12 GB, RTX 4070) con Q4_K_M, y GPUs de 12 GB o mas con Q5_K_M.
- Cabe en GPU consumer: si, en modelos con 6 GB o mas de VRAM segun cuantizacion.
- Opciones de despliegue: LM Studio, Atomic Chat y llama.cpp (libreria declarada `gguf`); los adaptadores LoRA en bfloat16 permiten fusion con PEFT/Unsloth.
- Ajustes de inferencia recomendados por el autor: pensamiento activado (`<|channel>thought\n`), token de parada `<turn|>`, temperatura 1,0, top-p 0,95, top-k 64, penalizacion de repeticion 1,0 y penalizacion de presencia 0,1.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Estado |
|---|---|---|---|---|---|
| Gemma-4-12B-Gemini-3.5-FlashLite-Distill | ~11,9B | no disponible | apache-2.0 | GGUF + LoRA | Archivado y declarado defectuoso por el autor |
| google/gemma-4-12B-it (modelo base) | ~11,9B | no disponible | no disponible en la informacion | safetensors/GGUF (no disponible) | Disponible |
| Ajuste posterior de Gemma 4 E4B de win10kimo | no disponible | no disponible | no disponible | no disponible | Recomendado por el autor como sustituto |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- El autor marca el repositorio como archivado y declara que el modelo es defectuoso por un error en el entrenamiento; recomienda descargar otros modelos de su perfil.
- El modelo esta superado por un ajuste posterior de Gemma 4 E4B del mismo autor.
- Entrenado sobre trayectorias de un solo turno; no esta disenado para razonamiento multi-turno complejo ni para agentes de multiples pasos.
- Las cuantizaciones de 3 bits (Q3_K_S) pueden producir errores de sintaxis menores en scripts largos, segun el autor.
- Riesgo de alucinacion en comandos y rutas no vistas durante el entrenamiento, especialmente en entornos distintos de los cubiertos por el dataset.
- Sesgos conocidos: no disponibles.
- Idiomas soportados: no disponibles; el dataset parece centrado en entornos Windows y Linux en ingles, aunque no se especifica.
- Licencia apache-2.0 declarada, que permite uso comercial, pero debe verificarse la compatibilidad con la licencia del modelo base google/gemma-4-12B-it, no indicada en la informacion.
- No se recomienda su uso en produccion dado el estado archivado y defectuoso declarado por el autor.

## Enlaces

- Hugging Face: https://huggingface.co/win10kimo/Gemma-4-12B-Gemini-3.5-FlashLite-Distill
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Perfil del autor: https://huggingface.co/win10kimo
