# Valexiem/Qwen3.8-27B-Fast60L-Voodoo-GGUF

## Resumen

Qwen3.8-27B-Fast60L-Voodoo-GGUF es una cuantizacion extrema del modelo Qwen 3.8 27B publicada por el usuario Valexiem en HuggingFace. No se trata de un modelo entrenado desde cero, sino de una derivacion del repositorio unsloth/Qwen3.8-27B-GGUF sometida a un proceso propio bautizado como "Voodoo Dynamic Quantization": recorte de profundidad hasta 60 capas, cuantizacion por tensor de precision mixta y poda de vocabulario sin perdida declarada. El resultado es un fichero GGUF de 5,58 GiB que el autor reporta como funcional para aritmetica, logica deductiva y generacion de codigo Python.

El modelo parte de una arquitectura hibrida con `arch = qwen35` y `full_attention_interval = 4`, es decir, ciclos estrictos de cuatro capas en los que tres son capas Gated DeltaNet (modelo de espacio de estados recurrente) y una es atencion multi-cabeza completa. El autor sostiene que esta periodicidad impone restricciones duras: la poda de profundidad solo puede hacerse en multiplos de 4 y 60 capas constituyen el limite inferior por debajo del cual la coherencia se rompe, con colapso de la generacion de codigo a 52 capas y confabulacion aritmetica a 48.

Su relevancia es fundamentalmente practica: propone una receta reproducible para ejecutar un modelo de 27B nominales con contexto declarado de hasta 1.048.576 tokens en una unica GPU de consumo (RTX 4070 de 12 GB), con velocidades de 38,8 t/s a 256.000 tokens y 22,8 t/s a 1M mediante la cache asimetrica `kvarn2` de BeeLlama. Conviene subrayar que el repositorio registra 0 descargas y 0 "likes", y que todas las cifras proceden exclusivamente de la model card del autor, sin verificacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida `qwen35`: ciclos de 4 capas con 3 capas Gated DeltaNet SSM + 1 capa de atencion completa MHA (`full_attention_interval = 4`) |
| Parametros totales | 27B nominales segun el nombre del modelo; el recorte de 65 a 60 capas reduce el recuento real, no cuantificado en la informacion disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 256.000 tokens con offload completo en 12 GB de VRAM; hasta 1.048.576 tokens con cache asimetrica `kvarn2` de BeeLlama |
| Tipos de cuantizacion | Cuantizacion dinamica por tensor: IQ1_S (1,56 bpw), IQ2_XXS, IQ1_M, IQ3_XXS (3,06 bpw), Q3_K, Q8_0 (8,5 bpw) |
| Idiomas soportados | en (ingles); el vocabulario multilingue fue podado |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura no es un transformer puro. Segun la model card, el modelo se repite en un ciclo estricto de cuatro capas: tres capas Gated DeltaNet (SSM recurrente, 14 tensores cada una) seguidas de una capa de atencion multi-cabeza completa (11 tensores). El autor documenta que podar capas fuera de este patron rompe la periodicidad de los estados recurrentes y de las cabezas KV, provocando fallos en el tiempo de ejecucion de CUDA; de ahi la regla de recortar siempre en multiplos de 4. El modelo base original contiene 65 capas (0 a 63 mas una capa 64 con cabecera de borrador NextN), y el proceso aplicado elimina las capas 28, 29, 30, 31 y 64, dejando 60 capas alineadas 1:1 con la matriz de importancia de 496 entradas de Unsloth (`imatrix_unsloth.gguf`). Un parche binario in-place fija `qwen35.nextn_predict_layers = 0`.

No hay entrenamiento nuevo: se trata de un proceso de compresion sobre pesos ya entrenados, con reescalado por importancia por tensor. Las decisiones clave son la proteccion de `ssm_out.weight` en IQ3_XXS (que el autor identifica como causa raiz de los bucles de repeticion cuando se degrada a IQ1_S), la fijacion de `ssm_alpha` y `ssm_beta` en Q8_0, la compresion de `ffn_gate`, `attn_qkv`, `attn_k`, `attn_q`, `attn_v`, `attn_gate` y `attn_output` a IQ1_S, y el mantenimiento de `ffn_up` y `ffn_down` en IQ2_XXS. Adicionalmente se aplica una poda de vocabulario con cierre BPE que elimina 118.300 tokens multilingues no usados (-47,6 %), conservando 130.020 tokens (latin, griego, notacion matematica y glifos de dibujo de cajas de terminal). No se documenta ningun uso de RLHF, DPO ni ajuste por preferencias, ni la composicion del dataset de entrenamiento original.

## Capacidades

- Generacion de texto en ingles: caso base del pipeline declarado (`text-generation`).
- Aritmetica basica verificada por el autor con la prueba `10 + 15 = 25` en la variante de 60 capas.
- Logica deductiva segun la evaluacion cualitativa de la model card.
- Generacion de codigo Python: se valida con un problema de programacion dinamica (`coin_change`) resuelto correctamente en la variante de 60 capas.
- Contexto largo: hasta 1.048.576 tokens con cache asimetrica `kvarn2`, y 256.000 tokens con offload completo en 12 GB de VRAM.
- Procesamiento de salidas de terminal: el vocabulario podado retiene explicitamente glifos de dibujo de cajas usados por interfaces de linea de comandos.
- Notacion matematica y alfabeto griego conservados tras la poda de vocabulario.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision, audio o modo "thinking": no disponibles en la informacion proporcionada.
- Capacidades multilingues: no disponibles; el idioma declarado es unicamente ingles y la poda elimino 118.300 tokens de otros idiomas.

## Casos de uso

- Asistente de programacion local en GPU de consumo: con 5,58 GiB de pesos, el modelo se carga por completo en una RTX 4070 de 12 GB dejando margen para la cache KV, lo que permite generar funciones Python (validado con programacion dinamica) sin enviar codigo a servicios externos.
- Analisis de repositorios o documentacion extensa: la ventana de hasta 1M tokens con `kvarn2` permite introducir arboles de codigo, historiales de commits o manuales completos en una sola pasada, manteniendo el contexto entre ficheros relacionados.
- Validacion logica y aritmetica en pipelines de prueba: el modelo resuelve correctamente operaciones basicas y deducciones, por lo que puede actuar como comprobador de sanidad en flujos automatizados que necesiten verificar resultados numericos generados por otro sistema.
- Despliegue en entornos aislados o air-gapped: al ser un unico fichero GGUF de 5,58 GiB ejecutable con llama.cpp, encaja en maquinas sin conectividad ni acceso a APIs externas, con requisitos de VRAM moderados.
- Parseo y resumen de logs de terminal: la retencion de glifos box-drawing y de la notacion CLI permite procesar salidas de herramientas de consola sin corromper la estructura visual de los listados.
- Investigacion sobre cuantizacion extrema: el repositorio documenta una receta completa de tipos por tensor (`tensor_types_voodoo.txt`), por lo que sirve como caso de estudio reproducible sobre el efecto de la precision mixta en arquitecturas hibridas SSM/atencion.
- Generacion de documentacion tecnica en ingles: es el idioma declarado y el unico con cobertura de vocabulario completa tras la poda.
- Inferencia hibrida CPU+GPU en equipos sin GPU dedicada: llama.cpp permite repartir capas entre CPU y GPU, aunque el autor solo documenta el escenario de offload completo.

## Benchmarks y rendimiento

Los siguientes datos proceden exclusivamente de la model card del autor y no han sido verificados de forma independiente. Se midieron sobre una RTX 4070 (12 GB, 504 GB/s), AMD Ryzen 7 7800X3D, 64 GB DDR5-6000 y Windows 11, con llama.cpp `b10665` (`-ngl 99`, `-fa 1`, `--temp 0.0`). La tabla original aparece truncada en la informacion disponible, por lo que la fila de la variante de 60 capas esta incompleta.

| Variante | Capas | Vocabulario | Tamano | Prefill (pp512) | Generacion (tg128) | Aritmetica (10+15) | Python DP (coin_change) | Estado |
|---|---|---|---|---|---|---|---|---|
| Vanilla baseline | 64 | 248.320 | 7,26 GB | 1132 t/s | 43,2 t/s | 25 (correcto) | DP correcto | Modelo base sin podar |
| Naive IQ2_XXS-48L | 48 | 129.006 | 5,23 GB | 1332 t/s | 60,2 t/s | 0 tokens (fallo) | 3 stubs vacios + bucle (fallo) | Roto por inanicion de tensores |
| Voodoo-48L-P1G | 48 | 130.020 | 4,58 GB | 1410 t/s | 56,1 t/s | Confabulacion (fallo) | Emite EOS (fallo) | Por debajo del limite estructural |
| Voodoo-52L-P1G | 52 | 130.020 | 4,91 GB | 1340 t/s | 46,5 t/s | 25 (correcto) | Emite EOS (fallo) | Aritmetica intacta, codigo roto |
| Voodoo-60L-P1G | 60 | 130.020 | 5,58 GiB | no disponible (fila truncada) | no disponible (fila truncada) | no disponible (fila truncada) | no disponible (fila truncada) | Variante recomendada por el autor |

Datos adicionales reportados por el autor para la variante de 60 capas: aproximadamente 50 tokens/s en generacion, 100 % de offload en VRAM a 256.000 tokens de contexto con 38,8 t/s, y 22,8 t/s a 1.048.576 tokens mediante la cache asimetrica `kvarn2` de BeeLlama.

## Requisitos de hardware

- VRAM estimada para inferencia: 5,58 GiB de pesos en la variante de 60 capas, mas la cache KV correspondiente al contexto configurado.
- GPU recomendada por el autor: NVIDIA GeForce RTX 4070 (12 GB de VRAM, 504 GB/s), escenario en el que se documenta 100 % de offload a 256.000 tokens de contexto.
- Cabe en GPU de consumo: si, con 12 GB de VRAM o mas. El autor no documenta el comportamiento en GPUs de 8 GB.
- CPU y plataforma de referencia: AMD Ryzen 7 7800X3D (8 nucleos, 16 hilos, 3D V-Cache) y 64 GB de DDR5-6000.
- Sistema operativo de las pruebas: Windows 11 (PowerShell).
- Opciones de despliegue: llama.cpp (build `b10665` en las pruebas) y BeeLlama para la cache asimetrica `kvarn2`. Soporte en vLLM, Ollama, TGI u otros motores no disponible en la informacion proporcionada.
- Latencia y throughput: prefill de 1340-1410 t/s (pp512) y generacion de 46,5-56,1 t/s (tg128) en las variantes podadas de 48 y 52 capas; 38,8 t/s a 256.000 tokens de contexto y 22,8 t/s a 1.048.576 tokens en la variante de 60 capas.
- Almacenamiento: el fichero GGUF ocupa 5,58 GiB, frente a los 7,26 GB del modelo base sin podar.

## Comparativa con modelos similares

No se han identificado en la informacion disponible modelos de terceros directamente comparables. La comparacion se limita a las variantes de la propia familia y al modelo base del que derivan.

| Modelo | Capas | Vocabulario | Tamano | Licencia | Coherencia aritmetica | Codigo Python | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Voodoo-60L-P1G (este modelo) | 60 | 130.020 | 5,58 GiB | apache-2.0 | Correcta segun el autor | Valido segun el autor | Publicado, 0 descargas |
| Voodoo-52L-P1G | 52 | 130.020 | 4,91 GB | apache-2.0 | Correcta | Roto (emite EOS) | Variante descartada por el autor |
| Voodoo-48L-P1G | 48 | 130.020 | 4,58 GB | apache-2.0 | Confabulacion | Roto | Variante descartada por el autor |
| Vanilla baseline (sin podar) | 64 | 248.320 | 7,26 GB | no disponible | Correcta | Correcto | Referencia interna del autor |
| unsloth/Qwen3.8-27B-GGUF | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | Modelo base declarado |

## Limitaciones y advertencias

- Cobertura idiomatica reducida: el unico idioma declarado es el ingles y la poda de vocabulario elimino 118.300 tokens de otros idiomas (-47,6 % del vocabulario original). El rendimiento en castellano o en cualquier idioma no latin es previsiblemente nulo.
- Limite estructural declarado por el propio autor: por debajo de 60 capas el modelo colapsa. A 52 capas la generacion de codigo falla y a 48 la aritmetica se convierte en confabulacion. No es una degradacion gradual, sino un fallo funcional.
- Cuantizacion de muy baja precision: varias proyecciones se fijan en IQ1_S (1,56 bpw), lo que sitúa al modelo en el rango de compresion mas agresivo de llama.cpp y hace probable la perdida de capacidades no cubiertas por las pruebas del autor.
- Riesgo de alucinacion elevado: la propia model card documenta modos de fallo de confabulacion en variantes cercanas. En esta variante concreta no se han publicado evaluaciones de alucinacion.
- Ausencia total de validacion independiente: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta. Todos los benchmarks, incluidos los de coherencia, proceden del autor.
- Dependencia de una build concreta: las pruebas se realizaron con llama.cpp `b10665` y con BeeLlama para la cache `kvarn2`. El comportamiento en otras versiones o motores no esta documentado.
- Trazabilidad de los pesos limitada: el modelo base es a su vez un GGUF derivado (`unsloth/Qwen3.8-27B-GGUF`), de modo que la cadena completa de procedencia no esta verificada.
- Metadatos incompletos: la model card aparece truncada en la tabla de benchmarks, por lo que faltan las cifras de rendimiento de la variante recomendada.
- Confusion potencial de nomenclatura: el identificador "Qwen3.8" y la fecha de creacion (15 de septiembre de 2026) no se corresponden con ninguna familia publica verificable en la informacion proporcionada.
- Sin informacion sobre soporte de tool calling, agentes, vision o audio: no debe asumirse ninguna de estas capacidades.
- Licencia apache-2.0 declarada, lo que en principio permite uso comercial, pero la licencia del modelo base y de los pesos originales no se detalla en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Valexiem/Qwen3.8-27B-Fast60L-Voodoo-GGUF
- Modelo base declarado: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Perfil del autor: https://huggingface.co/Valexiem

Nota sobre la busqueda web: los resultados obtenidos no guardan relacion con el modelo. Corresponden a documentacion de soporte de Microsoft sobre inicio y cierre de sesion en Hotmail y Outlook, actualizaciones de seguridad de Exchange Server y configuracion de la frecuencia de refresco en Windows. No se ha localizado ningun paper, blog, repositorio ni demo adicional asociado a este modelo.
