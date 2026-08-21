# translate-studio/MiLMMT-46-4B-v1.0-6bit-MLX

## Resumen

MiLMMT-46-4B v1.0 es un modelo de traducción automática multilingüe desarrollado por Xiaomi Research, basado en la arquitectura Gemma 3 de Google. El checkpoint original incluye una torre de visión SigLIP, pero esta conversión de `translate-studio` la elimina para ofrecer una versión exclusivamente textual, cuantizada a 6 bits con grupo de tamaño 64 y empaquetada en formato MLX para ejecución eficiente en Apple Silicon. El modelo cubre 46 idiomas y está pensado para traducción on-device sin depender de servicios en la nube.

Esta versión concreta (6-bit) se publica como un escalón intermedio de una escalera de cuantización que incluye también variantes de 5 y 4 bits. Según la model card, la versión de 5 bits ya muestra una degradación estadísticamente indistinguible del modelo en bf16, por lo que la de 6 bits se ofrece para quienes necesiten un margen adicional de calidad en cargas de trabajo distintas a las evaluadas. El repositorio pesa 3,2 GB y el checkpoint cuantizado ocupa aproximadamente 3,0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma3ForConditionalGeneration (text-only, sin torre de vision) |
| Parametros totales | 4B (modelo base); 849.095.168 segun metadatos del safetensors cuantizado |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6-bit, group size 64, affine (6,501 bits/weight) |
| Idiomas soportados | 46 (ver lista completa en seccion de capacidades) |
| Licencia | Gemma Terms of Use |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo base, `xiaomi-research/MiLMMT-46-4B-v1.0`, es un `Gemma3ForConditionalGeneration` con una torre de visión SigLIP y un proyector multimodal. Esta conversión elimina ambos componentes, dejando únicamente el modelo de lenguaje, lo que reduce el tamaño de 8,6 GB (bf16 con visión) a 3,0 GB. La cuantización se realiza con el formato MLX, utilizando 6 bits por peso con grupo de tamaño 64 y esquema afín (6,501 bits/weight efectivos).

El entrenamiento del modelo original se describe en el artículo *Reference-Free Post-Training of Open Large Language Models for Multilingual Machine Translation* (arXiv:2608.10812), donde se aplica un post-entrenamiento sin referencias para mejorar la traducción multilingüe. No se dispone de detalles adicionales sobre el dataset o el proceso de entrenamiento en la información proporcionada.

## Capacidades

- Traduccion automatica entre 46 idiomas, incluyendo pares en→X y X→en.
- Idiomas soportados: arabe, azerbaiyano, bulgaro, bengali, catalan, checo, danes, aleman, griego, ingles, español, persa, finlandes, frances, hebreo, hindi, croata, hungaro, indonesio, italiano, japones, kazajo, jemer, coreano, lao, malayo, birmano, noruego, neerlandes, polaco, portugues, rumano, ruso, eslovaco, esloveno, sueco, tamil, tailandes, tagalo, turco, urdu, uzbeko, vietnamita, cantonés, chino simplificado y chino tradicional.
- Modalidad exclusivamente textual: no procesa imagenes ni otros inputs multimodales.
- No incluye soporte de tool calling, agentes ni razonamiento multi-paso; su funcion es exclusivamente traduccion.
- Formato de prompt simple, sin plantilla de chat ni tokens de turno.

## Casos de uso

- Traduccion on-device en dispositivos Apple: al estar cuantizado en MLX y pesar solo 3 GB, puede ejecutarse en Macs con Apple Silicon sin conexion a internet, ideal para aplicaciones de traduccion offline.
- Atencion al cliente multilingue: un caso documentado en GitHub utiliza este modelo para traducir tickets de soporte entre 46 idiomas de forma privada, sin enviar datos sensibles a APIs externas.
- Traduccion de documentos y contenido web: su ventana de contexto (no especificada) permite procesar parrafos completos, aunque se recomienda segmentar textos largos.
- Integracion en pipelines de localizacion: puede usarse como motor de traduccion automatica en flujos de trabajo de software, documentacion tecnica o marketing.
- Validacion de calidad de traduccion: al comparar salidas de diferentes cuantizaciones (4, 5 y 6 bits), se puede estudiar el impacto de la compresion en la fidelidad de la traduccion.
- Prototipado rapido de aplicaciones de traduccion: gracias a su formato MLX y a la API de `mlx-lm`, es sencillo integrarlo en scripts de Python para pruebas de concepto.

## Benchmarks y rendimiento

La model card incluye una evaluacion de la escalera de cuantizacion (5-bit y 4-bit) frente al modelo bf16 original, medida en FLORES+ devtest, direccion en→X, 45 idiomas × 100 frases (4.500 segmentos por escalon), con chrF++ contra referencias humanas y significancia estadistica mediante bootstrap pareado de sacrebleu (2.000 remuestras). La version de 6 bits no fue medida directamente; su posicion se infiere por monotonicidad del error de cuantizacion.

| Escalon | Tamano | chrF++ medio | Δ vs bf16 (agrupado) | p | Idiomas por debajo de bf16 |
|---|---:|---:|---:|---:|---:|
| bf16 (referencia) | 7,3 GB | 53,86 | — | — | — |
| 5-bit | 2,70 GB | 53,83 | −0,04 | 0,20 | 23 / 45 |
| 4-bit | 2,22 GB | 53,06 | −0,88 | 0,0005 | 40 / 45 |

La version de 6 bits no fue evaluada directamente. Segun la model card, el error de cuantizacion es monotonico con el ancho de bits, por lo que se espera que su rendimiento sea igual o ligeramente superior al de 5-bit, pero con un coste de 480 MB adicionales.

## Requisitos de hardware

- VRAM estimada: aproximadamente 3,0 GB para el checkpoint cuantizado (6-bit), mas overhead de ejecucion.
- GPU recomendadas: cualquier Apple Silicon (M1, M2, M3, M4) con al menos 8 GB de RAM unificada para margen comodo.
- Compatible con GPU de consumo: si, en Macs con Apple Silicon; no esta pensado para GPUs NVIDIA o AMD.
- Opciones de despliegue: `mlx-lm` (carga y generacion), integrable en scripts Python; tambien puede usarse con `mlx` directamente.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del hardware y de la longitud de los textos.

## Comparativa con modelos similares

Se comparan las tres versiones cuantizadas del mismo modelo base, ya que no se dispone de datos de otros modelos de traduccion en la informacion proporcionada.

| Modelo | Tamano | Cuantizacion | chrF++ (en→X) | Licencia |
|---|---|---|---|---|
| MiLMMT-46-4B bf16 | 7,3 GB | bf16 | 53,86 | Gemma |
| MiLMMT-46-4B 5-bit MLX | 2,70 GB | 5-bit | 53,83 | Gemma |
| MiLMMT-46-4B 6-bit MLX (este) | ~3,0 GB | 6-bit | no medido | Gemma |
| MiLMMT-46-4B 4-bit MLX | 2,22 GB | 4-bit | 53,06 | Gemma |

La version de 6 bits ofrece un equilibrio entre tamano y calidad, aunque la de 5 bits es la recomendada por el autor por su relacion calidad-peso.

## Limitaciones y advertencias

- No soporta los idiomas telugu, marathi y gujarati: si se solicita traduccion hacia o desde estos idiomas, el modelo devuelve texto en hindi/devanagari en lugar de un error, por lo que es necesario filtrar las entradas al conjunto soportado.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede producir traducciones inventadas o inexactas, especialmente con textos ambiguos o fuera de dominio.
- Modalidad solo texto: la torre de vision se elimina, por lo que no puede procesar imagenes ni documentos escaneados.
- Licencia restrictiva: al derivar de Gemma, se aplican los Terminos de Uso de Gemma, que incluyen una politica de usos prohibidos; es necesario revisarlos antes de un despliegue comercial.
- La version de 6 bits no fue evaluada directamente: su rendimiento se infiere por monotonicidad, no por medicion propia, por lo que en cargas de trabajo muy distintas a FLORES+ podria comportarse de forma inesperada.
- No es un modelo de chat: no tiene plantilla de conversacion ni soporte para dialogos multi-turno; su unica funcion es la traduccion de frases individuales.

## Enlaces

- Repositorio HuggingFace: [translate-studio/MiLMMT-46-4B-v1.0-6bit-MLX](https://huggingface.co/translate-studio/MiLMMT-46-4B-v1.0-6bit-MLX)
- Modelo base: [xiaomi-research/MiLMMT-46-4B-v1.0](https://huggingface.co/xiaomi-research/MiLMMT-46-4B-v1.0)
- Version 5-bit: [translate-studio/MiLMMT-46-4B-v1.0-5bit-MLX](https://huggingface.co/translate-studio/MiLMMT-46-4B-v1.0-5bit-MLX)
- Version 4-bit: [translate-studio/MiLMMT-46-4B-v1.0-4bit-MLX](https://huggingface.co/translate-studio/MiLMMT-46-4B-v1.0-4bit-MLX)
- Paper (arXiv): [2608.10812](https://arxiv.org/abs/2608.10812)
- Repositorio oficial de Xiaomi: [xiaomi-research/gemmax](https://github.com/xiaomi-research/gemmax)
- Ejemplo de uso en traduccion de tickets: [RayCodes_Xiaomi_Translation](https://github.com/47thtechcorner/RayCodes_Xiaomi_Translation)
- Terminos de uso de Gemma: [ai.google.dev/gemma/terms](https://ai.google.dev/gemma/terms)
