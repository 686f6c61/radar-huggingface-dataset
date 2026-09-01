# ThakiCloud/Qwen3.8-27B-vi-cjk-suppressed

## Resumen

`ThakiCloud/Qwen3.8-27B-vi-cjk-suppressed` no es un modelo de lenguaje independiente, sino un **parche de pesos** (máscara) diseñado para aplicarse sobre el modelo base `Qwen/Qwen3.8-27B` de Alibaba. Su objetivo es reducir la aparición de caracteres chinos, japoneses y coreanos (CJK) en las respuestas en vietnamita, un problema conocido de "confusión de idiomas" en modelos multilingües. El autor, ThakiCloud, distribuye únicamente un script Python (`apply_mask.py`) y un archivo JSON con la máscara (`mask_vi_t1.json`), que modifican exclusivamente la capa `lm_head` del modelo base.

El parche sustituye las filas de la matriz de pesos correspondientes a tokens que contienen kanji, kana o hangul por un vector negativo proporcional a la media de los estados ocultos del modelo, de modo que esos tokens obtengan logits muy bajos y rara vez sean seleccionados durante la generación. La máscara incluye 65.695 tokens, el mayor de la serie de parches del autor. Es importante señalar que **no se han publicado mediciones de eficacia para vietnamita**; solo existe una validación completa para coreano, con resultados prometedores pero no extrapolables automáticamente.

Este proyecto es relevante para desarrolladores que despliegan Qwen3.8-27B en aplicaciones orientadas al mercado vietnamita y necesitan garantizar una salida limpia en alfabeto latino, sin incurrir en un fine-tuning completo. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (parche sobre Qwen3.8-27B, transformer multimodal denso) |
| Parametros totales | No aplica; el modelo base tiene 27 mil millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificada; heredada del modelo base |
| Tipos de cuantizacion | No aplica; el parche es un archivo JSON y un script |
| Idiomas soportados | Vietnamita (objetivo); el base es multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | No aplica; se distribuye como script Python y JSON de mascara |

## Arquitectura y entrenamiento

Este proyecto no implica entrenamiento. Se trata de una **modificación post-hoc** de la capa de salida (`lm_head.weight`) del modelo base. El método consiste en:

1. Realizar un forward pass con textos representativos del idioma objetivo (en el script por defecto son frases en coreano, aunque para vietnamita deberían cambiarse) para calcular `mu_h`, la media de los estados ocultos.
2. Para cada token que contenga caracteres CJK (kanji, kana o hangul), reemplazar su fila en `lm_head.weight` por `-alpha * mu_h / ||mu_h||^2`, con `alpha = 200`.
3. Como `lm_head` no tiene bias, esta sustitución produce logits muy negativos para esos tokens, haciendo prácticamente imposible que sean elegidos durante el muestreo.

El script `apply_mask.py` verifica los márgenes de logits antes de escribir los cambios y, tras aplicarlos, recarga el modelo para comprobar que ningún otro tensor ha sido modificado. No se requiere GPU para aplicar la máscara; basta con CPU y unos minutos.

## Capacidades

- **Supresión de caracteres CJK en salida vietnamita**: el parche elimina tokens que contienen kanji, kana o hangul, reduciendo la contaminación visual en respuestas en vietnamita.
- **Conservación de las capacidades del modelo base**: al modificar solo `lm_head`, el resto de la red (atención, MLP, embeddings) permanece intacta. El modelo base Qwen3.8-27B es multimodal (acepta imagen y texto), con capacidades de codificación, razonamiento, agente y modo "thinking".
- **Verificación mediante sondas**: el repositorio incluye pruebas que confirman que tokens vietnamitas comunes (Xin chào, Việt Nam, cảm ơn bạn, công nghệ) se conservan, mientras que tokens CJK (中国, 日本語, 电脑, ありがとう, 한국) se suprimen.
- **Aplicación selectiva**: la máscara solo afecta a la generación; no altera el tokenizador ni los embeddings de entrada.

## Casos de uso

- **Chatbots de atención al cliente en vietnamita**: al desplegar Qwen3.8-27B con este parche, las respuestas en vietnamita no contendrán caracteres CJK, mejorando la experiencia del usuario final en aplicaciones de soporte.
- **Generación de contenido editorial en vietnamita**: redacción de artículos, descripciones de producto o publicaciones en redes sociales donde la pureza del alfabeto latino es un requisito de calidad.
- **Traducción automática vietnamita**: integración en pipelines de traducción que requieren que la salida en vietnamita no incluya caracteres de otros sistemas de escritura, especialmente cuando el texto fuente contiene CJK.
- **Subtitulación de vídeo**: generación de subtítulos en vietnamita para plataformas de streaming, evitando la aparición de caracteres chinos o japoneses que romperían la legibilidad.
- **Procesamiento de documentos oficiales**: generación de resúmenes o respuestas en vietnamita para trámites administrativos, donde la mezcla de alfabetos podría causar rechazo o confusión.
- **Integración en agentes conversacionales para el mercado vietnamita**: asistentes virtuales que necesitan mantener coherencia lingüística estricta en vietnamita, sin depender de un fine-tuning costoso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para la versión vietnamita de este parche. El autor indica explícitamente que **no ha medido** la reducción de contaminación en vietnamita ni la regresión de capacidades (codificación, MMLU, etc.).

La única medición completa corresponde al parche equivalente para coreano (`Qwen3.8-27B-ko-cjk-suppressed`), con los siguientes resultados:

| Metrica | Antes | Despues |
|---|---|---|
| Tasa de contaminacion CJK | 2,55 % | 0,68 % |
| Tasa de error real | 1,81 % | 0,18 % |
| Prompts evaluados | 3.369 | 3.369 |
| Prueba estadistica | — | McNemar p < 0,0001 |

Estos datos no deben extrapolarse a vietnamita sin verificación. El propio autor advierte de un caso donde la predicción con un modelo pequeño (0,20 %) no coincidió con la medición real (1,33 %).

## Requisitos de hardware

- **Aplicación del parche**: solo CPU, sin GPU. El script `apply_mask.py` procesa el archivo de pesos en unos minutos.
- **Inferencia con el modelo base**: Qwen3.8-27B en bf16 ocupa aproximadamente 55,6 GB en disco y requiere al menos 60 GB de VRAM para inferencia en precisión completa. Una GPU A100 80 GB o H100 80 GB es suficiente; también es posible usar varias RTX 4090 (24 GB cada una) con tensor parallelism.
- **Cuantizaciones**: el modelo base admite cuantizaciones como NVFP4 (4 bits) con atención FP8, que reduce el peso a 22,9 GB (2,43x de reducción), permitiendo su ejecución en GPUs de 24 GB o 32 GB.
- **Opciones de despliegue**: vLLM, TGI, llama.cpp, Ollama (si se convierte a GGUF). El parche debe aplicarse antes de cargar el modelo en el servidor de inferencia.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Enfoque | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | Modelo completo multimodal | 27B | No especificado | Apache 2.0 | Hugging Face |
| ThakiCloud/Qwen3.8-27B-vi-cjk-suppressed | Parche de lm_head para suprimir CJK | No aplica (usa el base) | Heredado | Apache 2.0 | Hugging Face |
| dnotitia/smoothie-qwen | Ajuste de lm_head para suprimir chino | No especificado | No especificado | No especificada | GitHub |

No se dispone de datos de rendimiento comparativo entre estos enfoques. La principal diferencia es que `smoothie-qwen` se centra en suprimir chino de forma general, mientras que este parche incorpora una determinación de repertorio por idioma (incluyendo codificaciones legacy) y una estructura de niveles específica para cada lengua.

## Limitaciones y advertencias

- **Sin mediciones para vietnamita**: la eficacia del parche en este idioma no ha sido verificada experimentalmente. El autor recomienda no asumir que funciona igual que en coreano.
- **Sensibilidad a la temperatura**: en las pruebas con coreano, la temperatura afecta significativamente a la tasa de contaminación (9,33 % a T=1,0 frente a 1,92 % a T=0,0). Se recomienda usar temperaturas bajas.
- **Límite del recorte**: caracteres raros que no tienen un token propio en el vocabulario se ensamblan a partir de fragmentos de bytes, y esos tokens de bytes no pueden eliminarse. La supresión no es absoluta.
- **No corrige la mezcla de inglés**: los tokens en inglés se conservan por necesidad (código, nombres propios, unidades), por lo que la contaminación en inglés no se aborda con esta técnica.
- **Es un saneamiento, no una mejora de estilo**: el parche no mejora la fluidez ni la naturalidad del vietnamita; solo elimina caracteres no deseados.
- **Interferencia con usos legítimos de CJK**: si el usuario solicita explícitamente caracteres chinos (por ejemplo, explicar el origen etimológico de una palabra sino-vietnamita), la máscara bloqueará esa salida. En esos casos debe desactivarse.
- **Script con textos de prueba en coreano**: el `apply_mask.py` incluye `PROBE_TEXTS` en coreano; para usarlo con vietnamita es necesario reemplazarlos por frases en vietnamita, ya que `mu_h` debe representar la media de estados ocultos del idioma objetivo.

## Enlaces

- [Hugging Face: ThakiCloud/Qwen3.8-27B-vi-cjk-suppressed](https://huggingface.co/ThakiCloud/Qwen3.8-27B-vi-cjk-suppressed)
- [Hugging Face: Qwen/Qwen3.8-27B (modelo base)](https://huggingface.co/Qwen/Qwen3.8-27B)
- [GitHub: dnotitia/smoothie-qwen](https://github.com/dnotitia/smoothie-qwen)
- [Paper: SASFT (ICLR 2026)](https://arxiv.org/abs/2507.14894)
- [Paper: Korean token pruning](https://arxiv.org/abs/2604.16235)
- [Paper: TLPO (ACL 2026)](https://arxiv.org/abs/2604.26553)
