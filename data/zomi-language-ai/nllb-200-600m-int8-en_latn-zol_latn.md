# zomi-language-ai/nllb-200-600M-int8-en_Latn-zol_Latn

## Resumen

El modelo `nllb-200-600M-int8-en_Latn-zol_Latn` es una versión cuantizada a INT8 y convertida a CTranslate2 del modelo NLLB-200 Distilled 600M de Meta AI, ajustado específicamente para la traducción automática de inglés a zomi (lengua también conocida como zo o zomi, escrita en alfabeto latino). Lo publica la organización zomi-language-ai, centrada en recursos lingüísticos para esta comunidad de lengua de bajos recursos, y deriva de un checkpoint intermedio propio (`nllb-200-distilled-600M-finetuned-en_Latn-to-zol_Latn`, paso 50.000).

El problema que resuelve es la ausencia de sistemas de traducción viables para una lengua de bajos recursos como el zomi, que no dispone de un código oficial en NLLB-200 ni en FLORES. Para ello, el autor introduce un identificador de lengua propio, `zol_Latn`, que debe usarse como token de destino junto con `eng_Latn` como token de origen. La cuantización INT8 y el formato CTranslate2 reducen el peso del repositorio a unos 0,7 GB y permiten inferencia eficiente en CPU, lo que facilita el despliegue en entornos sin GPU.

La relevancia actual reside en su orientación práctica: es un modelo pequeño (600M de parámetros, arquitectura transformer encoder-decoder), con licencia CC BY 4.0, pensado para localización de contenidos, preservación lingüística y asistencia a traductores de la comunidad zomi, más que para competición en benchmarks generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (NLLB-200 Distilled), convertido a CTranslate2 |
| Parametros totales | 600M (modelo base NLLB-200 Distilled 600M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | INT8 (unica version publicada en este repositorio) |
| Idiomas soportados | en (origen); zol, ctd, csy, gnb, kmm, pck, smt, vap, zom (etiquetados en la model card, orientados a zomi y variedades relacionadas) |
| Licencia | CC BY 4.0 |
| Formato de pesos | CTranslate2 (modelo cuantizado INT8); no se publican safetensors ni GGUF en este repositorio |

## Arquitectura y entrenamiento

El modelo parte de `facebook/nllb-200-distilled-600M`, un transformer encoder-decoder multilingüe destilado de NLLB-200, y se ajusta finamente sobre un corpus paralelo inglés-zomi de elaboración propia (`dataset: custom`). El checkpoint resultante del fine-tuning (paso 50.000) se convierte al formato CTranslate2 y se cuantiza a INT8 para reducir el uso de memoria y la latencia de inferencia. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del corpus ni si se aplicaron técnicas de RLHF o DPO; al tratarse de un modelo de traducción, el entrenamiento es de tipo supervisado sobre pares de frases.

La innovación técnica principal no está en la arquitectura, sino en la extensión del esquema de etiquetado de lenguas de NLLB: se introduce `zol_Latn` como código personalizado para el zomi en escritura latina, ausente en la lista oficial de FLORES/NLLB. La cuantización INT8 sobre CTranslate2 es la otra decisión relevante, orientada a despliegue en CPU y dispositivos con recursos limitados.

## Capacidades

- Traducción automática neuronal unidireccional de inglés (`eng_Latn`) a zomi (`zol_Latn`).
- Generación de texto traducido en escritura latina para la lengua zomi.
- Ejecución eficiente en CPU gracias a la cuantización INT8 y al runtime CTranslate2.
- Etiquetado multilingüe heredado de NLLB para varias variedades relacionadas (ctd, csy, gnb, kmm, pck, smt, vap, zom), aunque el ajuste fino está orientado a zomi.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.
- No se documenta modo de razonamiento (thinking) ni capacidades multimodales.

## Casos de uso

- Localización de contenidos educativos: traducción de materiales didácticos del inglés al zomi para escuelas y programas comunitarios, aprovechando que el modelo fue ajustado con corpus paralelos de dominio general.
- Localización de sitios web y aplicaciones: integración del modelo CTranslate2 en un servicio de traducción que convierta cadenas de interfaz y textos de ayuda al zomi, con inferencia en CPU para abaratar costes.
- Preservación lingüística: generación de versiones en zomi de textos de referencia y documentación, apoyando iniciativas de la comunidad zomi para mantener y difundir su lengua escrita.
- Asistencia a traductores humanos: producción de borradores automáticos que traductores nativos revisan y poseditan, reduciendo el tiempo de traducción en pares de bajos recursos.
- Investigación en traducción de bajos recursos: uso como línea base reproducible para experimentos con corpus inglés-zomi y para evaluar el impacto de la cuantización INT8 frente a FP16/FP32.
- Despliegue en entornos con recursos limitados: servicio de traducción en dispositivos edge o servidores sin GPU, gracias al tamaño reducido del repositorio (0,7 GB) y al runtime CTranslate2.
- Traducción de documentación técnica o administrativa: conversión de manuales y avisos del inglés al zomi, con revisión posterior por hablantes nativos para terminología específica.

## Benchmarks y rendimiento

La model card declara métricas BLEU y chrF como métricas de evaluación, pero el `model-index` publicado no contiene resultados:

```json
[
  {
    "name": "nllb-200-600M-int8-en_Latn-zol_Latn",
    "results": []
  }
]
```

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de un modelo de 600M de parámetros en INT8, el peso de los pesos ronda los 0,6-0,7 GB, por lo que la huella de memoria es muy reducida.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU con al menos 2 GB de memoria libre debería poder ejecutarlo, incluidas GTX 1650, RTX 3060, RTX 4090, A100 o H100.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU de consumo moderna con 2 GB o más de VRAM; también está diseñado para funcionar en CPU.
- Opciones de despliegue: CTranslate2 (runtime nativo del modelo), con integración habitual en servidores de traducción como LibreTranslate o en scripts Python mediante la API de CTranslate2. No se publican pesos GGUF ni safetensors en este repositorio, por lo que llama.cpp, Ollama o vLLM no son aplicables directamente a estos artefactos.
- Latencia y throughput estimados: no disponibles en la información proporcionada; la cuantización INT8 y CTranslate2 están orientados a reducir latencia y memoria frente a FP16/FP32.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| nllb-200-600M-int8-en_Latn-zol_Latn | 600M | no disponible | en → zol (y variedades etiquetadas) | CC BY 4.0 | CTranslate2 INT8 | Hugging Face (zomi-language-ai) |
| facebook/nllb-200-distilled-600M | 600M | no disponible | 200 lenguas (sin zol oficial) | CC BY-NC 4.0 | safetensors / transformers | Hugging Face (Meta AI) |
| zomi-language-ai/nllb-200-distilled-600M-finetuned-en_Latn-to-zol_Latn | 600M | no disponible | en → zol | no disponible en la informacion proporcionada | transformers (checkpoint) | Hugging Face (zomi-language-ai) |
| NLLB-200 1.3B / 3.3B (Meta AI) | 1.3B / 3.3B | no disponible | 200 lenguas (sin zol oficial) | CC BY-NC 4.0 | safetensors | Hugging Face (Meta AI) |

La comparación directa con alternativas específicas para inglés-zomi no está disponible en la información proporcionada; los modelos NLLB originales de Meta no incluyen `zol_Latn` como lengua oficial, por lo que no cubren este par de traducción sin ajuste adicional.

## Limitaciones y advertencias

- El rendimiento depende de la calidad y diversidad del corpus de ajuste fino inglés-zomi, no documentado en detalle.
- La terminología específica de dominio puede requerir adaptación adicional o un nuevo ajuste fino.
- Al ser un par de lenguas de bajos recursos, algunas traducciones pueden necesitar posedición por hablantes nativos fluidos.
- La cuantización INT8 puede introducir una degradación menor de calidad frente a versiones FP16 o FP32.
- `zol_Latn` no es un código oficial de NLLB-200 ni de FLORES; las herramientas que validan contra la lista oficial pueden no reconocerlo automáticamente.
- El modelo es unidireccional (inglés → zomi); no se documenta la dirección inversa.
- Riesgo de alucinación y de traducciones incorrectas en frases ambiguas o con vocabulario fuera del dominio de entrenamiento, habitual en modelos NMT de bajos recursos.
- No se documentan sesgos específicos; al entrenarse con un corpus comunitario, puede reflejar sesgos de las fuentes utilizadas.
- La licencia CC BY 4.0 permite uso comercial con atribución, pero conviene verificar las condiciones del modelo base NLLB (CC BY-NC 4.0) antes de un despliegue comercial, ya que la licencia del derivado no elimina las restricciones del original.
- No se publican pesos en safetensors ni GGUF en este repositorio, lo que limita su uso con ecosistemas distintos de CTranslate2.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zomi-language-ai/nllb-200-600M-int8-en_Latn-zol_Latn
- Modelo base: https://huggingface.co/facebook/nllb-200-distilled-600M
- Checkpoint intermedio del autor: https://huggingface.co/zomi-language-ai/nllb-200-distilled-600M-finetuned-en_Latn-to-zol_Latn
- Organización del autor: https://huggingface.co/zomi-language-ai
- Paper de NLLB-200 (No Language Left Behind): no disponible en la información proporcionada
- Documentación de CTranslate2: no disponible en la información proporcionada
