# Taimwe/securecoder-scripts

## Resumen

SecureCoder es un ajuste fino mediante QLoRA sobre `Qwen/Qwen3-Coder-30B-A3B-Instruct`, un modelo de arquitectura MoE de 30,5B parámetros totales y unos 3B activos por token. El objetivo declarado por el autor (Taimwe) es cubrir tres habilidades simultáneamente: generación de código, tool calling y ciberseguridad, tanto ofensiva como defensiva. El repositorio publicado en HuggingFace se presenta como un runbook de entrenamiento, no como un checkpoint listo para producción: documenta la elección del modelo base, la mezcla de datos, los detalles de cómputo y los costes medidos.

La relevancia del proyecto está en su enfoque metodológico: el autor justifica la elección del base comparando alternativas por parámetros, licencia y soporte de tool calling, y documenta con identificadores de job los cálculos de coste y las tasas de entrenamiento medidas. La mezcla de datos suma aproximadamente 57.000 filas, de las cuales alrededor del 30% son de tool calling, completadas con código (Magicoder), seguridad (Trendyol, Fenrir, OWASP, CTF) y un bloque de replay conversacional (FineTome-100k) para evitar el colapso del seguimiento de instrucciones.

No se han publicado pesos cuantizados, resultados de benchmarks ni métricas de calidad en la información disponible. La ficha de HuggingFace registra 0 descargas y 0 likes, y no declara licencia ni idiomas soportados para el artefacto resultante, aunque el modelo base es Apache-2.0. El repositorio parece contener scripts de entrenamiento más que pesos finales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con mezcla de expertos (MoE), heredada del base Qwen3-Coder-30B-A3B-Instruct |
| Parametros totales | 30,5B (del modelo base; el ajuste no publica recuento propio) |
| Parametros activos | ~3B por token |
| Longitud de contexto | no disponible (no especificada en la model card) |
| Tipos de cuantizacion | No se publican pesos cuantizados. El entrenamiento se realizo en QLoRA 4-bit; GGUF, AWQ y GPTQ: no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible en la ficha de HuggingFace (el modelo base es Apache-2.0) |
| Formato de pesos | no disponible (el repositorio se describe como scripts de entrenamiento) |

## Arquitectura y entrenamiento

El ajuste se aplica sobre un modelo MoE code-specialised con plantilla nativa de tool calling. La elección del base se justifica por coste de entrenamiento: al activar solo ~3B parámetros por token, el modelo "entrena como uno de 3B" y cabe en 4 bits en 48 GB de VRAM, lo que abarata el ciclo de iteración frente a alternativas densas de tamaño similar. El autor descarta partir de checkpoints abliterated de la comunidad por procedencia poco clara, y plantea la eliminación de rechazos como una edición de pesos posterior e independiente (sección 6 del runbook, no detallada en la información disponible).

La mezcla de datos está balanceada por cuota fija por fuente. Cada fila se convierte a mensajes de chat y se renderiza con la plantilla propia del modelo, de modo que el formato de entrenamiento coincide con el de inferencia (`<|im_start|>…<tool_call><function=NAME><parameter=…>`).

| Fuente | Filas | Tipo | Que aporta |
|---|---|---|---|
| `NousResearch/hermes-function-calling-v1` `[func_calling]` | 9.000 | tool calling | conversaciones completas con esquemas JSON |
| `NousResearch/hermes-function-calling-v1` `[func_calling_singleturn]` | 3.000 | tool calling | selección de función sin conversación |
| `lockon/xlam-function-calling-60k` | 10.000 | tool calling | pares consulta → llamada de API |
| `ise-uiuc/Magicoder-OSS-Instruct-75K` | 10.000 | código | problemas y soluciones self-instruct |
| `Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset` | 8.000 | seguridad | instrucciones de seguridad |
| `AlicanKiraz0/Cybersecurity-Dataset-Fenrir-v2.1` | 5.000 | seguridad | preguntas y respuestas amplias |
| `Humanlearning/CyberSecurity_OWASP-sft-dataset` | 3.000 | código seguro | OWASP y programación defensiva |
| `MrClipperz134/CTF-Instruct` | 3.000 | CTF | reto → solución |
| `TrueNix/ctf-solver-dataset` | 3.000 | CTF | trayectorias de resolución |
| `mlabonne/FineTome-100k` | 3.000 | replay | chat general para no perder seguimiento de instrucciones |
| **Total** | **~57.000** | — | ~30% tool calling |

El autor documenta dos trampas de formato detectadas durante el desarrollo: los esquemas de herramientas deben ser planos (`{"name", "description", "parameters"}`) y no ir envueltos en `"function"`, y el campo `arguments` debe ser un mapping y no una cadena JSON, error que hacía que xLAM aportara 0 filas de forma silenciosa. La función `render_record()` detecta la convención de la plantilla una vez y la reutiliza. Se excluyó deliberadamente `dpevzner/Cybersecurity_Reasoning_Dataset` por cambios de esquema y campos vacíos en la revisión publicada. También se excluye, por decisión de alcance declarada, cualquier material orientado a construir malware o exploits weaponizados; se mantienen reconocimiento, enumeración, conceptos de explotación, CTF e ingeniería defensiva.

## Capacidades

- Generación de código: entrenado con 10.000 filas de Magicoder-OSS-Instruct (problemas y soluciones).
- Tool calling y function calling: núcleo del ajuste, con ~30% de las filas dedicadas a conversaciones con herramientas, selección de función y pares consulta → llamada de API (xLAM).
- Ciberseguridad ofensiva y defensiva: instrucciones de seguridad, Q&A amplio, desarrollo seguro estilo OWASP y resolución de retos CTF.
- Codificación segura: dataset OWASP orientado a prácticas defensivas.
- Resolución de retos CTF: instrucción → solución y trayectorias de resolución.
- Seguimiento de instrucciones general: mantenido mediante un bloque de replay con FineTome-100k.
- Formato de chat nativo Qwen3-Coder, incluida la sintaxis de llamada a herramientas de la plantilla del base.
- Capacidades multimodales, de audio, de visión o modo de razonamiento explícito: no disponibles en la información proporcionada.
- Soporte multilingüe: no disponible (no se declaran idiomas).

## Casos de uso

- Asistente de programación en IDE: el modelo puede completar y explicar código en el mismo dialecto de plantilla con el que fue entrenado, con el bloque de replay evitando la degradación del seguimiento de instrucciones conversacionales.
- Integración de APIs mediante tool calling: los 22.000 ejemplos de Hermes y xLAM permiten mapear una consulta en lenguaje natural a una llamada de función con argumentos en formato mapping, adecuado para orquestadores tipo agente.
- Revisión de código con criterios de seguridad: el dataset OWASP aporta ejemplos de detección de patrones inseguros, útil en revisiones previas a merge o en pipelines de CI/CD.
- Formación y concienciación en seguridad: puede generar explicaciones sobre conceptos de reconocimiento, enumeración y explotación conceptual sin producir herramientas de ataque, según el alcance declarado del dataset.
- Práctica de CTF: dado un enunciado de reto, el modelo fue entrenado con 6.000 filas de instrucción y trayectorias de resolución, por lo que puede plantear hipótesis y pasos de solución.
- Automatización de tareas de oficina técnica con llamadas a herramientas: cualquier flujo que requiera seleccionar la función correcta a partir de una descripción, gracias al subconjunto singleturn.
- Base para un ajuste posterior especializado: al ser un adaptador QLoRA sobre un base Apache-2.0, sirve como punto de partida documentado para dominios verticales, con la receta de datos y costes ya medida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones de seguridad para el modelo ajustado.

Los únicos datos numéricos publicados son de rendimiento de entrenamiento, no de calidad del modelo:

| Metrica | Valor | Contexto |
|---|---|---|
| Velocidad de entrenamiento medida | 0,8 filas/s | Job de smoke test en `a100-large`, batch 2 × grad-accum 8, max seq 2048, packing activado |
| Tiempo por paso | ~20 s | Incluye unos minutos de warm-up de `torch.compile` que no se repiten por paso |
| Epoca completa (mezcla de ~57.000 filas) | ~20 h | Estimacion sobre `l40sx1` a 1,80 $/h, ~36 $ |
| Media mezcla (~28.000 filas) | ~10 h | ~18 $ |
| Mezcla reducida (~19.000 filas) | ~7 h | ~12 $ |

## Requisitos de hardware

- Entrenamiento con la receta documentada: `l40sx1` con 48 GB de VRAM a 1,80 $/h en HuggingFace Jobs, con el modelo base en 4 bits. Alternativas verificadas por el autor: `a100-large` (80 GB, 2,50 $/h), `rtx-pro-6000` (96 GB, 2,75 $/h) y `h200` (141 GB, 5,00 $/h).
- El propio autor descarta `t4-small` (16 GB) para un modelo de 30B en 4 bits; `l4x1` (24 GB, 0,80 $/h) y `a10g-large` (24 GB, 1,50 $/h) se reservan para modelos de 9B a 14B.
- Inferencia en 4 bits: los pesos de un MoE de 30,5B ocuparían del orden de 16-20 GB, pero esta cifra es una estimación del editor a partir del recuento de parámetros y no está verificada por el autor.
- GPU de consumo: no hay confirmación de despliegue en RTX 4090 u otras GPU de 24 GB; con 24 GB el margen para contexto y caché KV sería muy ajustado y no está validado en la información disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponibles. No se publican pesos ni instrucciones de inferencia, solo scripts de entrenamiento.
- Latencia y throughput de inferencia: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Licencia | Contexto | Disponibilidad |
|---|---|---|---|---|---|
| SecureCoder (este ajuste) | 30,5B heredados | ~3B | no disponible | no disponible | Repositorio de scripts; 0 descargas, 0 likes |
| `Qwen/Qwen3-Coder-30B-A3B-Instruct` (base) | 30,5B MoE | ~3B | Apache-2.0 | no disponible | Publico en el Hub; code-specialised con tool calling nativo |
| `Qwen/Qwen3.8-27B` | 27,8B dense | 27,8B | Apache-2.0 | no disponible | Mejor calidad bruta segun el autor, pero ~4 veces mas lento por paso |
| `Qwen/Qwen3-Coder-Next` | 79,7B | no disponible | Apache-2.0 | no disponible | Requiere tarjeta de 80 GB en 4 bits |
| `TokenRhythm/NeoHorse-1-9B` | 9,0B | no disponible | Apache-2.0 | no disponible | Alternativa de respaldo si solo hay T4; etiquetas `tool-use` y `reasoning` |
| `openbmb/MiniCPM5-2B` | 2,5B | no disponible | Apache-2.0 | no disponible | Etiqueta `tool-calling`; valido para pruebas de humo en T4, techo bajo |

`Qwen/Qwen3.8-Flash-Next` (180B) fue descartado por el autor por su licencia `other`, de tipo no comercial. Los datos de esta tabla provienen del propio runbook y reflejan la seleccion del autor, no evaluaciones independientes.

## Limitaciones y advertencias

- No hay resultados de benchmarks publicados: no existe evidencia medida de mejora sobre el modelo base en código, tool calling o seguridad.
- El repositorio registra 0 descargas y 0 likes, por lo que no ha sido validado por terceros.
- La licencia del artefacto ajustado no está declarada en la ficha de HuggingFace; la del base (Apache-2.0) no se hereda automáticamente sin que el autor lo haga explícito. Verificar antes de cualquier uso comercial.
- El repositorio parece contener scripts de entrenamiento, no pesos finales; no es desplegable tal cual sin ejecutar el pipeline.
- El runbook menciona una fase posterior de eliminación de rechazos (abliteration, sección 6) que no se detalla. Si se aplica, el modelo resultante tendría una política de seguridad alineada debilitada y podría emitir contenido que el base rechazaría.
- Doble uso en ciberseguridad: el ajuste incluye material ofensivo (reconocimiento, enumeración, conceptos de explotación y CTF). Aunque el autor excluye explícitamente la construcción de malware y exploits weaponizados, la frontera es difusa y el uso indebido es posible.
- Riesgo de alucinación en consejos de seguridad y en código generado, especialmente en versiones de bibliotecas y APIs que cambian con el tiempo.
- No se declaran idiomas soportados ni longitud de contexto; el comportamiento multilingüe y con contextos largos es desconocido.
- Los datos de coste y velocidad son mediciones del propio autor con identificadores de job, no reproducidos de forma independiente.
- Las fechas de creación y actualización del repositorio (2026-09-24) y los nombres de algunos modelos base candidatos no han podido contrastarse con fuentes externas.
- Los resultados de búsqueda web devueltos para este modelo no contienen ninguna referencia relevante: consisten en foros y preguntas en chino sin relación con el proyecto.

## Enlaces

- HuggingFace: https://huggingface.co/Taimwe/securecoder-scripts
- Modelo base: `Qwen/Qwen3-Coder-30B-A3B-Instruct` (referencia citada en el runbook, no enlazada explícitamente)
- Paper, blog, repositorio de código o demo: no disponibles
- La búsqueda web no devolvió ningún resultado relevante sobre este modelo.
