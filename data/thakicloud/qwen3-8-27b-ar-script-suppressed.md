# ThakiCloud/Qwen3.8-27B-ar-script-suppressed

## Resumen

`ThakiCloud/Qwen3.8-27B-ar-script-suppressed` no es un modelo con pesos propios, sino una **máscara de vocabulario** diseñada para reducir la contaminación de escritura persa y urdu en las salidas en árabe del modelo base `Qwen/Qwen3.8-27B`. El autor, ThakiCloud, modifica únicamente la matriz `lm_head.weight` del modelo base, sustituyendo las filas correspondientes a tokens de escritura perso-urdu (como پ, چ, ژ, گ, ی, ک) por una dirección que fuerza su logit a valores muy negativos, de modo que el modelo no los genere al responder en árabe. El resultado es un ajuste quirúrgico que no requiere reentrenamiento ni GPU para aplicarse.

El problema que resuelve es real: los modelos multilingües grandes, al generar texto en árabe, tienden a mezclar caracteres de escrituras vecinas que comparten bloque Unicode, como el farsi y el urdu. Esto rompe búsquedas, normalización, sistemas de TTS y cualquier pipeline que espere árabe estándar. La máscara se distribuye como un script de Python y tres archivos JSON con los índices de tokens a suprimir, con distintos niveles de agresividad. El autor es transparente: **no ha medido la reducción de contaminación en árabe**; solo ha validado la máscara a nivel de tokenizador y ha publicado mediciones para una versión coreana equivalente. La licencia es Apache 2.0, igual que el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (basado en Qwen3.8-27B) |
| Parametros totales | 27 000 millones (modelo base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (depende del modelo base) |
| Tipos de cuantizacion | No aplica (no se distribuyen pesos, solo mascara y script) |
| Idiomas soportados | Arabe (objetivo de la mascara); el modelo base soporta multiples idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | No aplica (mascara en JSON, script Python) |

## Arquitectura y entrenamiento

La mascara no altera la arquitectura del modelo base. `Qwen3.8-27B` es un transformer denso multimodal de 27 000 millones de parametros, con capacidad de entrada de imagen y texto, y soporte de modo de razonamiento (thinking mode). El ajuste propuesto por ThakiCloud opera exclusivamente sobre la capa de salida: para cada token objetivo (por ejemplo, los caracteres persas y urdu que comparten bloque Unicode con el arabe), se reemplaza la fila correspondiente de `lm_head.weight` por un vector proporcional a la media de los estados ocultos del modelo cuando genera en arabe, con un factor alpha de 200. La formula es `W_i := -alpha * mu_h / ||mu_h||^2`, donde `mu_h` se mide mediante un forward pass con textos de ejemplo en arabe. Como `lm_head` no tiene bias, esta sustitucion hace que el logit de esos tokens sea muy negativo, impidiendo que sean seleccionados por el argmax. El script `apply_mask.py` valida los margenes antes de escribir y verifica tras la escritura que no se hayan modificado otros tensores.

El autor no ha realizado un entrenamiento completo; se trata de una intervencion post-hoc sobre un modelo ya entrenado. No se han publicado datos sobre el dataset de entrenamiento del modelo base ni sobre el proceso de medicion de `mu_h` para arabe (el script incluye textos de prueba en coreano, que deben adaptarse al idioma objetivo). La mascara se basa en un criterio de repertorio: se conservan los caracteres arabigos estandar (incluyendo digitos arabo-indios, tashkil y signos coranicos) y se suprimen los caracteres perso-urdu que no pertenecen al arabe clasico.

## Capacidades

- **Supresion de escritura perso-urdu en salidas arabes**: la mascara elimina tokens como پ, چ, ژ, گ, ی (FARSI YEH) y ک (KEHEH), asi como caracteres urdu como ٹ, ڈ, ڑ, ں, ھ, ے.
- **Preservacion de caracteres arabigos legitimos**: conserva digitos arabo-indios (٠-٩), tashkil (vocales diacriticas), signos coranicos y ligaduras de cortesia como ﷺ y ﷲ (en la mascara por defecto t1).
- **Capacidades del modelo base intactas**: al no modificar mas que `lm_head`, el modelo conserva todas sus capacidades originales: razonamiento, generacion de codigo, matematicas, comprension visual (imagen, OCR, VQA), tool calling y modo de pensamiento.
- **Aplicacion sin GPU**: el script se ejecuta en CPU en pocos minutos, sin necesidad de recursos de entrenamiento.
- **Niveles de agresividad configurables**: tres mascaras (t1, t2, t3) con distinto numero de tokens suprimidos (815, 825 y 66 520 respectivamente). t2 elimina ademas las presentaciones arabes (U+FB50-FDFF, U+FE70-FEFF), lo que rompe ligaduras de cortesia; t3 es mas agresiva aun.
- **No corrige mezcla de ingles**: el autor advierte que la contaminacion con tokens en ingles no se puede eliminar con esta tecnica, ya que esos tokens son necesarios para codigo, nombres propios y unidades.

## Casos de uso

- **Procesamiento de texto arabe en pipelines de busqueda y normalizacion**: empresas que indexan contenido arabe necesitan que las salidas del LLM no contengan caracteres persas o urdu, porque los motores de busqueda y los normalizadores Unicode fallan ante esas variantes. Aplicar la mascara garantiza que el texto generado sea arabe estandar, listo para indexar.
- **Sistemas de sintesis de voz (TTS) en arabe**: los motores TTS esperan texto en arabe clasico; la presencia de caracteres persas o urdu produce pronunciaciones incorrectas o errores. La mascara reduce ese riesgo al suprimir esos tokens en la generacion.
- **Traduccion automatica arabe-espanol o arabe-ingles**: al evitar la mezcla de escrituras, la salida en arabe es mas limpia y facil de procesar por el traductor, mejorando la precision en tareas de traduccion.
- **Generacion de contenido editorial en arabe estandar**: medios de comunicacion y redactores que necesitan producir texto en arabe moderno estandar (MSA) sin interferencias dialectales o de escrituras vecinas pueden usar el modelo con la mascara para mantener la coherencia ortografica.
- **Asistentes virtuales y chatbots en arabe**: en aplicaciones de atencion al cliente, la salida debe ser comprensible y correcta ortograficamente. La mascara evita que el asistente escriba "سلام خوبی" (persa) en lugar de "السلام عليكم" (arabe).
- **Validacion y control de calidad de modelos de lenguaje**: el script y las mascaras pueden usarse como herramienta de auditoria para detectar y corregir fugas de escritura en otros modelos, o como base para experimentos de poda de vocabulario en otros idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para esta mascara en arabe. El autor indica explicitamente que no ha medido la reduccion de contaminacion en arabe ni la regresion de capacidades (coding, MMLU, etc.). Solo se han publicado mediciones para la version coreana equivalente (`Qwen3.8-27B-ko-cjk-suppressed`), donde la tasa de contaminacion bajo de 2.55% a 0.68% y los errores reales de 1.81% a 0.18% en 3 369 prompts pareados (McNemar p < 0.0001). El autor advierte que no se debe asumir que el mismo rendimiento se traslada al arabe, citando un caso donde la prediccion del proxy (0.20%) difirio del valor real (1.33%) en un modelo mas pequeno.

## Requisitos de hardware

- **Aplicacion de la mascara**: solo CPU, unos minutos. No se requiere GPU. El script `apply_mask.py` descarga el modelo base (55.6 GB en FP16) y modifica un unico tensor.
- **Inferencia con el modelo resultante**: los requisitos son los del modelo base `Qwen3.8-27B`. Para una cuantizacion 4-bit (por ejemplo, GPTQ o AWQ) se necesitan aproximadamente 16-18 GB de VRAM, lo que cabe en una RTX 4090 (24 GB) o una A100 40 GB. Para FP16 se requieren alrededor de 54 GB, por lo que se necesita una A100 80 GB o dos GPUs de 24 GB en paralelo.
- **Opciones de despliegue**: el modelo base es compatible con vLLM, llama.cpp, Ollama y TGI. La mascara se aplica antes de cargar el modelo, por lo que no afecta al runtime.
- **Latencia y throughput**: no se han publicado mediciones especificas para esta mascara. En general, un modelo de 27B en una A100 puede generar entre 20 y 40 tokens por segundo en FP16, y mas con cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ThakiCloud/Qwen3.8-27B-ar-script-suppressed | 27B (base) | No disponible | Mascara sobre lm_head | Apache 2.0 | Mascara y script en HF |
| Qwen/Qwen3.8-27B (base) | 27B | No disponible | Modelo completo | Apache 2.0 | Pesos en HF |
| dnotitia/smoothie-qwen | No disponible | No disponible | Ajuste de lm_head para suprimir chino | No disponible | Repo en GitHub |

La comparativa se limita a trabajos relacionados, ya que no existen otras mascaras publicas para supresion de escritura perso-urdu en arabe. `dnotitia/smoothie-qwen` es un proyecto previo que ajusta `lm_head` de Qwen para suprimir chino, y ThakiCloud lo cita como inspiracion. No hay datos de rendimiento comparables.

## Limitaciones y advertencias

- **Sin mediciones en arabe**: el autor no ha verificado la eficacia de la mascara en arabe. Solo hay validacion a nivel de tokenizador y mediciones para la version coreana. No se debe asumir el mismo rendimiento.
- **Dependencia de la temperatura**: el autor recomienda usar temperaturas bajas (T=0.0) porque en la medicion coreana la tasa de contaminacion vario de 9.33% (T=1.0) a 1.92% (T=0.0). Con temperaturas altas, la mascara puede ser menos efectiva.
- **Limite de poda**: la supresion no es total. Caracteres raros que no tienen token propio se ensamblan mediante tokens de bytes, que no se pueden eliminar sin romper el vocabulario.
- **No corrige mezcla de ingles**: la contaminacion con tokens en ingles (codigo, nombres propios, unidades) no se puede eliminar con esta tecnica.
- **Riesgo de regresion de capacidades**: no se ha medido si la mascara degrada el rendimiento en tareas como coding o razonamiento. El autor no lo ha evaluado.
- **Uso de t2 y t3 con precaucion**: t2 elimina ligaduras de cortesia como ﷺ y ﷲ, que son legitimas en arabe. Solo debe usarse si el objetivo es unificar ligaduras a caracteres normales.
- **Script con textos de prueba en coreano**: el `apply_mask.py` incluye `PROBE_TEXTS` en coreano, que deben adaptarse al arabe para que `mu_h` sea representativo. Si no se cambian, la mascara puede no funcionar correctamente.
- **No es una mejora de estilo**: es una medida de higiene ortografica, no un refinamiento estilistico del texto arabe.

## Enlaces

- [HuggingFace - ThakiCloud/Qwen3.8-27B-ar-script-suppressed](https://huggingface.co/ThakiCloud/Qwen3.8-27B-ar-script-suppressed)
- [HuggingFace - Qwen/Qwen3.8-27B (modelo base)](https://huggingface.co/Qwen/Qwen3.8-27B)
- [HuggingFace - ThakiCloud/Qwen3.8-27B-ko-cjk-suppressed (version coreana)](https://huggingface.co/ThakiCloud/Qwen3.8-27B-ko-cjk-suppressed)
- [GitHub - dnotitia/smoothie-qwen (trabajo relacionado)](https://github.com/dnotitia/smoothie-qwen)
- [Arxiv - SASFT (ICLR 2026)](https://arxiv.org/abs/2507.14894)
- [Arxiv - Korean token pruning](https://arxiv.org/abs/2604.16235)
- [Arxiv - TLPO (ACL 2026)](https://arxiv.org/abs/2604.26553)
