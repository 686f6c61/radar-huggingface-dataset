# Uuuuuuniiiiiii/goldworm-v6-2x2-experts-asm

## Resumen

goldworm-v6-2x2-experts-asm es un checkpoint de investigación publicado por el usuario Uuuuuuniiiiiii en HuggingFace. Se trata de un modelo de lenguaje a nivel de byte con arquitectura de mezcla de expertos (MoE), obtenido mediante *upcycling* del modelo denso goldworm-v6 (2,76 M de parámetros) y ajustado durante 12 minutos en una única GPU RTX 4060 de portátil para una tarea muy concreta: traducir instrucciones x86-64 entre su representación en ensamblador (sintaxis Intel de objdump) y su codificación en hexadecimal.

El modelo no es un modelo de propósito general ni un asistente conversacional. Solo conoce una distribución sintética estrecha de instrucciones de 64 bits (registros de 64 bits y formas de tipo mov/add/sub/xor/and/cmp/lea). Su interés es puramente metodológico: sirve como artefacto de demostración para estudiar si el *upcycling* a MoE aporta ventajas frente a un ajuste denso equivalente con el mismo presupuesto de cómputo. El propio autor concluye que el experimento es **inconcluso**.

Con 8.071.104 parámetros totales y 4.532.160 activos por token, contexto de 256 tokens y vocabulario de 256 bytes, es un modelo de escala de juguete orientado a investigación, no a producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder byte-level con FFN sustituida por MoE (top-2 de 4 expertos) |
| Parámetros totales | 8.071.104 |
| Parámetros activos | 4.532.160 por token |
| Longitud de contexto | 256 tokens |
| Tipos de cuantización | no disponible (solo pesos safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (modelo a nivel de byte, sin soporte lingüístico declarado) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder con d=192, 6 capas, 4 cabezas de atención, pre-LN, activación GELU, *embeddings* atados y sin sesgos en las capas lineales. Cada FFN se sustituye por 4 expertos (copias de la FFN de goldworm-v6 con ruido de 1e-3·std), un router `Linear(192,4)` con *gating* top-2 y pérdida auxiliar Switch de 0,01. Se añade un *group embedding* de tres vías (prefijo / entrada / salida) inicializado a cero sobre el *embedding* de token. El vocabulario es de 256 bytes y el contexto de 256 tokens.

El entrenamiento se realizó sobre 40.808 ejemplos sintéticos con formato `{task}|{inp}=>{out}\n`, calculando la pérdida solo sobre los bytes de salida, con AdamW, semilla 0 y 12 minutos de reloj de pared (≈28,5k pasos, 0,025 s/paso, 514 MiB de VRAM). El checkpoint publicado proviene de una segunda ejecución del mismo script con guardado de pesos añadido (`moe_clean_save.py`), que alcanzó 30.415 pasos, ya que la ejecución original no guardó los pesos. Las dos tareas son: A) asm → hex (`A|cmp rdx,0x49cf158d=>` → `4881fa8d15cf49`) y D) hex → asm (`D|488d6a39=>` → `lea rbp,[rdx+0x39]`). El código de inferencia es `modeling_goldworm_moe.py`, con nombres de claves coincidentes con el safetensors.

## Capacidades

- Traducción de instrucciones x86-64 individuales de ensamblador (sintaxis Intel de objdump) a hexadecimal (tarea A).
- Traducción inversa de hexadecimal a ensamblador (tarea D).
- Procesamiento a nivel de byte (vocabulario de 256 bytes, sin tokenizador subword).
- Enrutamiento MoE con top-2 expertos por token (uso medio top-1 por experto: 0,277 / 0,187 / 0,265 / 0,272).
- No soporta *tool calling* ni *function calling*.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades multilingües declaradas.
- No dispone de modo *thinking*, visión ni audio.
- No es un modelo de código general ni de chat.

## Casos de uso

- Verificación de codificación de instrucciones en herramientas de análisis binario: dado un mnemónico y operandos, el modelo puede proponer la codificación hexadecimal para contrastarla con un ensamblador real (GNU as), como hace el Space acompañante.
- Desensamblado asistido en pipelines de ingeniería inversa: para instrucciones dentro de la distribución entrenada (mov/add/sub/xor/and/cmp/lea de 64 bits), el modelo puede generar la forma ensambladora a partir de los bytes, siempre con verificación posterior con objdump.
- Docencia y demostración de codificación x86-64: sirve para ilustrar la correspondencia entre ensamblador y bytes en un entorno controlado y de bajo coste computacional.
- Estudio de *upcycling* a MoE: el checkpoint es un artefacto reproducible para investigar el efecto del *upcycling* frente a ajuste denso con el mismo presupuesto de tiempo, dado que el autor documenta el script y el hash sha256.
- Pruebas de infraestructura de inferencia MoE a pequeña escala: con 514 MiB de VRAM en entrenamiento y 8 M de parámetros, permite validar implementaciones de *gating* top-2 y routers en hardware de consumo.
- Generación de datos sintéticos de pares asm/hex para aumentar un corpus de entrenamiento de modelos mayores, siempre que se filtren con un ensamblador real por la tasa de error observada.

## Benchmarks y rendimiento

Evaluación sobre 2.000 ejemplos de test IID, decodificación greedy, verificados con GNU as/objdump:

| Brazo | Parámetros (activos) | VPR (exacto) | IC 95% Wilson |
|---|---|---|---|
| Ajuste denso de v6 (mismos 12 min) | 2,76 M | 99,75% | [99,42; 99,89] |
| Brazo MoE, ejecución original (sin guardado) | 8,07 M (4,53 M) | 99,45% | [99,02; 99,69] |
| Este checkpoint (reentrenamiento con guardado) | 8,07 M (4,53 M) | 98,75% | [98,16; 99,15] |

Por tarea (este modelo, ejecución original): A 985/987, D 1004/1013. En el checkpoint publicado: tarea A asm→hex 965/987, tarea D hex→asm 1010/1013 (98,7% exacto). Una re-comprobación en CPU mediante el código del Space dio 396/400 verificados sobre los primeros 400 elementos de test. El autor califica el resultado de **inconcluso**: ambos brazos están en el techo, los intervalos de confianza se solapan, el brazo denso recibió 2,6 veces más pasos en el mismo tiempo y el *group embedding* solo existe en el brazo MoE (factor de confusión). La diferencia entre ejecuciones (kernels de GPU no deterministas, presupuesto de pasos por tiempo de reloj) es comparable a la diferencia MoE-denso.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el entrenamiento usó 514 MiB en una RTX 4060 de portátil, por lo que la inferencia cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: cualquier GPU con al menos ~1 GB de VRAM; RTX 4060, RTX 3060, GTX 1650 o incluso CPU.
- Cabe en GPU de consumo: sí, en todas las gamas actuales; también es viable en CPU.
- Opciones de despliegue: el autor proporciona `modeling_goldworm_moe.py` para inferencia directa con safetensors; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma agregada; el entrenamiento registró 0,025 s/paso con lotes no especificados. La re-comprobación en CPU del Space procesó 400 elementos sin métricas de latencia publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros (activos) | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| goldworm-v6-2x2-experts-asm | 8,07 M (4,53 M) | 256 | 98,75% exacto (test IID) | MIT | HuggingFace |
| goldworm-v6 (denso, ajuste 12 min) | 2,76 M | no disponible | 99,75% exacto (test IID) | MIT (según base) | HuggingFace |
| Brazo MoE original (sin pesos) | 8,07 M (4,53 M) | 256 | 99,45% exacto | no aplica (no publicado) | no disponible |

No se dispone de comparación con modelos de propósito general porque la tarea (traducción de instrucciones x86-64 aisladas) es específica y no existen alternativas públicas documentadas en la información proporcionada.

## Limitaciones y advertencias

- Instrucciones fuera de distribución (otros mnemónicos, formas de 32/16 bits, sintaxis AT&T, entradas multi-instrucción) fallan a menudo de forma silenciosa; hay que verificar siempre con un ensamblador.
- No es un modelo de código general ni de chat; no debe usarse como asistente.
- Riesgo de alucinación inherente: el modelo puede generar codificaciones plausibles pero incorrectas sin señal de error.
- Sesgos conocidos: no documentados, pero la distribución de entrenamiento es sintética y estrecha, lo que limita la generalización.
- Limitación de contexto: 256 tokens, insuficiente para secuencias de varias instrucciones.
- Limitación de idioma: modelo a nivel de byte sin capacidades lingüísticas declaradas; los idiomas soportados figuran como no disponibles.
- Restricciones de licencia: MIT, permite uso comercial; hereda la licencia de goldworm-v6. Los datos de entrenamiento se generaron con GNU binutils y no se incluye código de binutils.
- Caveat de producción: el propio autor lo describe como artefacto de demostración, no como evidencia de que MoE aporte ventajas; la comparación con el brazo denso es inconclusa.
- Integridad del checkpoint: sha256 de `model.safetensors` = `7858ef6f14b3fd72708b3c46aaa69606cf2a1e11e3c79c1b72bc8d48a01e80d3`.

## Enlaces

- HuggingFace: https://huggingface.co/Uuuuuuniiiiiii/goldworm-v6-2x2-experts-asm
- Modelo base: https://huggingface.co/Uuuuuuniiiiiii/goldworm-v6
- Código de inferencia: `modeling_goldworm_moe.py` (incluido en el repositorio)
- Script de entrenamiento con guardado: `moe_clean_save.py` (referenciado en la model card)
- Space acompañante de verificación: no disponible como URL en la información proporcionada
