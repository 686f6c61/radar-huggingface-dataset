# ThakiCloud/Qwen3.8-27B-zhTW-cjk-suppressed

## Resumen

`ThakiCloud/Qwen3.8-27B-zhTW-cjk-suppressed` no es un modelo completo, sino un **parche de supresión de caracteres** (mask) diseñado para aplicarse sobre el modelo base `Qwen/Qwen3.8-27B`. Su objetivo es reducir la mezcla de caracteres chinos simplificados y japoneses shinjitai (新字体) en las respuestas generadas en chino tradicional (zh-Hant-TW). El autor, ThakiCloud, publica únicamente un script y dos archivos JSON de máscaras que modifican la capa `lm_head` del modelo base, sin redistribuir los pesos completos.

La relevancia de este trabajo radica en un problema real de los modelos multilingües: cuando se les pide responder en chino tradicional, tienden a intercalar caracteres simplificados (p. ej. 电脑 en lugar de 電腦) y japoneses (p. ej. 実 en lugar de 實). El método propuesto utiliza una **prueba de pertenencia al repertorio Big5** para identificar y suprimir tokens que no son caracteres tradicionales, abordando de una sola vez ambos tipos de contaminación. El autor advierte explícitamente que **no ha medido la eficacia en chino tradicional**; solo ha validado el enfoque en coreano (con reducción de contaminación del 2,55 % al 0,68 %). Por tanto, este repositorio debe considerarse una herramienta experimental, no un modelo verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (basado en Qwen3.8-27B) |
| Parametros totales | 27 000 millones (heredados del base; el mask no altera el numero) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (depende del base; no se especifica en la informacion) |
| Tipos de cuantizacion | No aplica (el mask se aplica sobre pesos bf16; no se distribuyen cuantizaciones) |
| Idiomas soportados | Chino tradicional (zh-Hant-TW) como objetivo; el base soporta multiples idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | No se distribuyen pesos; el mask se entrega como JSON y script Python |

## Arquitectura y entrenamiento

El mask no implica entrenamiento. Se trata de un **ajuste determinista de la capa de salida** (`lm_head.weight`). El método reemplaza las filas correspondientes a tokens que caen fuera del repertorio Big5 (caracteres simplificados y shinjitai) por un vector proporcional a la dirección media del estado oculto del modelo cuando genera en el idioma objetivo:

```
W_i := -alpha * mu_h / ||mu_h||^2     (alpha = 200)
```

Donde `mu_h` se obtiene mediante un forward pass con textos de ejemplo en el idioma objetivo. Al no haber bias en `lm_head`, anular la fila no produce logits `-inf`, sino que fuerza a que el token suprimido nunca sea el argmax si hay otros candidatos con logits positivos. El script `apply_mask.py` verifica los márgenes de logits antes de escribir y revalida tras la escritura que ningún otro tensor haya cambiado.

El autor no ha realizado fine-tuning ni RLHF. El proceso es puramente post-procesamiento sobre el modelo base. Se ofrecen dos niveles de agresividad: `mask_zh-TW_t1.json` (32 211 tokens suprimidos, por defecto) y `mask_zh-TW_t2.json` (39 018 tokens, más agresivo).

## Capacidades

- **Supresion de caracteres no tradicionales**: elimina tokens que no pertenecen al repertorio Big5, cubriendo tanto simplificados como shinjitai en una sola pasada.
- **Hereda todas las capacidades del base**: al no modificar más que `lm_head`, el modelo resultante conserva las habilidades de Qwen3.8-27B en generacion de texto, razonamiento, codigo, matematicas, vision multimodal y agentes.
- **No introduce nuevas capacidades**: no anade tool calling, ni funciones especiales, ni mejora el rendimiento general.
- **Limitacion de alcance**: no corrige la mezcla de ingles ni de otros sistemas de escritura; solo actua sobre caracteres CJK fuera del repertorio Big5.

## Casos de uso

- **Generacion de documentacion tecnica en chino tradicional**: empresas que redactan manuales, guias o especificaciones en zh-Hant-TW pueden aplicar el mask para evitar que el modelo inserte caracteres simplificados, mejorando la coherencia tipografica.
- **Localizacion de software y UI**: al generar cadenas de interfaz en chino tradicional, el mask reduce la necesidad de revision manual de caracteres incorrectos, acelerando el flujo de traduccion.
- **Atencion al cliente en taiwan y hong kong**: chatbots desplegados en regiones de habla tradicional pueden beneficiarse de respuestas con menos contaminacion de simplificado, aunque el autor no ha verificado la eficacia en este idioma.
- **Procesamiento de documentos legales o academicos**: textos formales que requieren estricta ortografia tradicional (p. ej. 資訊, 網路) pueden generarse con menor riesgo de deslizamientos hacia 资讯 o 网络.
- **Investigacion en procesamiento de lenguaje natural**: el mask sirve como caso de estudio para tecnicas de poda de vocabulario dirigida por repertorio de codificacion, y puede compararse con otros metodos de supresion de idiomas.
- **Preparacion de datasets de entrenamiento**: al generar datos sinteticos en chino tradicional, el mask ayuda a producir corpus mas limpios, reduciendo el ruido de caracteres no deseados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explicitamente que **no ha medido** la reduccion de contaminacion en chino tradicional ni la regresion de capacidades (coding, MMLU, etc.). Unicamente se ha validado el metodo en coreano, con los siguientes resultados:

| Metrica | Antes | Despues |
|---|---|---|
| Tasa de contaminacion | 2,55 % | 0,68 % |
| Errores reales | 1,81 % | 0,18 % |

Estos datos corresponden al repositorio coreano (`Qwen3.8-27B-ko-cjk-suppressed`) y no deben extrapolarse al chino tradicional sin verificacion.

## Requisitos de hardware

- **Aplicacion del mask**: no requiere GPU. El script `apply_mask.py` se ejecuta en CPU en pocos minutos, siempre que se disponga del modelo base descargado (55,6 GB en bf16).
- **Inferencia con el modelo resultante**: los requisitos son los del base Qwen3.8-27B. Con cuantizacion de 4 bits (p. ej. GPTQ o AWQ) cabria en una GPU consumer de 24 GB (RTX 4090, RTX 3090). En bf16 se necesitan al menos 56 GB de VRAM, por lo que se requieren GPUs profesionales (A100 80GB, H100) o multiples GPUs.
- **Opciones de despliegue**: al ser un modelo estandar de 27B, puede servirse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama. El mask debe aplicarse antes de cualquier conversion o cuantizacion.
- **Latencia y throughput**: no se proporcionan datos especificos. Para un modelo de 27B en una A100, se puede esperar un throughput de decenas de tokens por segundo con vLLM, pero no hay mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | No disponible | Modelo completo multimodal | Apache 2.0 | HuggingFace |
| ThakiCloud/Qwen3.8-27B-zhTW-cjk-suppressed | 27B (mask) | No disponible | Parche de supresion de caracteres | Apache 2.0 | HuggingFace (solo mask) |
| ThakiCloud/Qwen3.8-27B-ko-cjk-suppressed | 27B (mask) | No disponible | Parche equivalente para coreano | Apache 2.0 | HuggingFace (solo mask) |

No se dispone de otros modelos comparables que aborden especificamente la supresion de caracteres en chino tradicional mediante poda de vocabulario. El trabajo previo `dnotitia/smoothie-qwen` (GitHub) sigue una direccion similar pero sin la distincion por repertorio de codificacion.

## Limitaciones y advertencias

- **No verificado en chino tradicional**: el autor no ha medido la eficacia real en este idioma. Existe un caso documentado donde la prediccion del proxy (0,20 %) difirio del resultado real (1,33 %) al aplicar la misma receta a un modelo mas pequeno.
- **Sensibilidad a la temperatura**: en las pruebas en coreano, la temperatura afecto la tasa de contaminacion en un factor de 5 (9,33 % a T=1,0 frente a 1,92 % a T=0,0). Se recomienda usar temperaturas bajas.
- **No elimina todos los caracteres no deseados**: los caracteres raros que no tienen token propio se ensamblan a partir de bytes, y esos tokens de byte no pueden suprimirse.
- **No corrige la mezcla de ingles**: los tokens en ingles se conservan por necesidad (codigo, nombres propios, unidades), por lo que la contaminacion en ingles persiste.
- **No apto para cantonés**: el mask elimina caracteres propios del cantonés (嘅, 喺, 啲, 哋, 嘢) porque estan fuera del repertorio Big5. No debe usarse para ese idioma.
- **Es una medida de higiene, no de estilo**: no mejora la calidad linguistica general ni el tono; solo reduce la aparicion de caracteres no tradicionales.
- **Riesgo de regresion de capacidades**: al suprimir tokens, podria degradarse el rendimiento en tareas que requieran esos caracteres (p. ej. codigo con identificadores en simplificado). No se ha evaluado este impacto.

## Enlaces

- Repositorio del mask: https://huggingface.co/ThakiCloud/Qwen3.8-27B-zhTW-cjk-suppressed
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Version coreana del mask: https://huggingface.co/ThakiCloud/Qwen3.8-27B-ko-cjk-suppressed
- Version para cantonés: https://huggingface.co/ThakiCloud/Qwen3.8-27B-yue-cjk-suppressed
- Repositorio GitHub del base: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Trabajo previo relacionado: https://github.com/dnotitia/smoothie-qwen
- Paper SASFT (ICLR 2026): https://arxiv.org/abs/2507.14894
- Paper sobre poda de tokens coreanos: https://arxiv.org/abs/2604.16235
- Paper TLPO (ACL 2026): https://arxiv.org/abs/2604.26553
