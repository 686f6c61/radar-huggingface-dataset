# vennyvirtuoso/sarvam-1-hindi-marathi

## Resumen
Sarvam-1 Hindi → Marathi es un ajuste fino completo (full fine-tuning) del modelo causal `sarvamai/sarvam-1`, desarrollado por el usuario `vennyvirtuoso` sobre la base de Sarvam AI. Con 2.525.087.744 parametros (2,52B), el checkpoint esta especializado en traduccion automatica de hindi (`hin_Deva`) a marathi (`mar_Deva`), dos idiomas del subcontinente indio con escasa representacion en los modelos genericos. El modelo resuelve el problema de la traduccion de calidad entre pares linguisticos indicos, un caso donde los modelos multilingues grandes suelen perder fidelidad gramatical por falta de datos paralelos especificos.

La relevancia actual del modelo reside en su relacion calidad/coste: al ser un transformer causal de 2,52B parametros, requiere aproximadamente 5,5 GB de VRAM en BF16/FP16, lo que lo hace desplegable en GPUs de consumo (RTX 3060/4060, T4, A10) y en CPU. El autor reporta un throughput de 22,6 frases por segundo, entre 2 y 3 veces superior al de modelos de 7B o mas, lo que lo posiciona para APIs de traduccion en tiempo real y procesamiento por lotes de documentos.

El entrenamiento se realizo sobre 2.095.356 pares paralelos deduplicados y filtrados semanticamente (Samanantar, BPCC, ILCI), con 3 epocas completas (~6,28M de muestras vistas) y una perdida de validacion que descendio de 28,04 a 1,4935. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, lo que facilita su integracion en productos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (causal-LM), basado en `sarvamai/sarvam-1` |
| Parametros totales | 2.525.087.744 (2,52B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el autor menciona BF16/FP16 para inferencia) |
| Idiomas soportados | hindi (hi), marathi (mr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo parte de `sarvamai/sarvam-1`, un transformer causal de 2,52B parametros orientado a generacion de texto en lenguas indicas. El ajuste realizado es un full fine-tuning: se actualizaron el 100% de los parametros, a diferencia de enfoques basados en LoRA o adaptadores. Segun el autor, esto permite una alineacion profunda con los rasgos gramaticales del marathi, como los sufijos de caso (*vibhakti*), las posposiciones y la concordancia de genero, numero y persona.

El corpus de entrenamiento consta de 2.095.356 pares paralelos hindi-marathi procedentes de Samanantar, BPCC e ILCI, deduplicados y filtrados mediante una puntuacion semantica LaBSE ≥ 0,75, con verificacion de ausencia de fuga del conjunto de test. Se completaron 3 epocas (~6,28M de muestras vistas). La perdida de validacion descendio de forma monotona desde 28,04 hasta 1,4935, lo que el autor presenta como evidencia de convergencia estable y ausencia de bucles de repeticion. La inferencia emplea la plantilla de chat del tokenizador de Sarvam (`<|user|>`, `<|assistant|>`) y generacion autorregresiva con cache KV. No se detalla en la informacion disponible si hubo fases de RLHF o DPO.

## Capacidades
- Traduccion automatica directa de hindi a marathi, con soporte de dominios como turismo, salud, clima, educacion, tecnologia, administracion y derecho.
- Generacion de texto causal en formato conversacional mediante la plantilla de chat del tokenizador Sarvam.
- Traduccion de prosa formal y periodistica, con resultados medidos en IN22-Gen.
- Traduccion de dialogo coloquial, con resultados medidos en IN22-Conv.
- Generacion autorregresiva con cache KV, optimizada para throughput alto (22,6 frases/s segun el autor).
- Soporte de inferencia en BF16/FP16 en GPU y en CPU.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito (thinking mode) en la informacion disponible.
- Capacidades multilingues limitadas a los dos idiomas declarados (hi, mr).

## Casos de uso
- Traduccion en tiempo real para APIs y chats: el throughput reportado de 22,6 frases/s y su baja huella de VRAM (~5,5 GB) permiten servir traduccion hindi-marathi en una API con latencia baja, adecuada para mensajeria o atencion al cliente bilingue.
- Traduccion por lotes de documentacion administrativa: los 249 pares de dominio administrativo del test interno (19,93 BLEU) y los 243 de ambito legal (18,00 BLEU) indican utilidad para digitalizar expedientes y comunicados oficiales entre ambos idiomas.
- Localizacion de contenido educativo: con 301 pares de dominio educativo y 26,65 BLEU en el test interno, el modelo puede traducir materiales didacticos y cursos entre hindi y marathi para plataformas de e-learning.
- Traduccion de contenido turistico: el dominio turismo obtiene el mejor resultado del desglose interno (37,02 BLEU, 51,92 chrF++), por lo que es adecuado para webs de viajes, guias y material promocional.
- Traduccion de articulos periodisticos: los resultados en IN22-Gen (18,93 BLEU, 0,7096 COMET-DA) respaldan su uso en redacciones que publiquen la misma noticia en hindi y marathi.
- Traduccion de conversaciones y subtitulos: IN22-Conv alcanza 16,91 BLEU y 0,7731 COMET-DA, el mejor COMET del conjunto de benchmarks, lo que lo hace apto para dialogo coloquial y subtitulado.
- Despliegue en hardware modesto: al caber en GPUs de consumo como RTX 3060/4060 y en CPU, sirve para prototipos, entornos de desarrollo y organizaciones sin infraestructura de GPU de datacenter.

## Benchmarks y rendimiento

Evaluacion sobre 9.550 pares de frases en 5 conjuntos de test, segun el autor:

| Benchmark | Muestras | SacreBLEU (flores200) | SacreBLEU (intl) | chrF++ | WMT22-COMET-DA |
|---|---:|---:|---:|---:|---:|
| In-House Testset (oct 2026) | 1.011 | 22,83 | 14,43 | 42,79 | 0,7384 |
| Held-Out Test (corpus split) | 5.000 | 21,72 | 13,24 | 39,12 | 0,7715 |
| FLORES-200 devtest | 1.012 | 20,76 | 10,35 | 39,99 | 0,7201 |
| IN22-Gen | 1.024 | 18,93 | 10,02 | 38,53 | 0,7096 |
| IN22-Conv | 1.503 | 16,91 | 11,32 | 37,21 | 0,7731 |

Desglose por dominio del test interno (1.011 pares):

| Dominio | Pares | SacreBLEU | chrF++ |
|---|---:|---:|---:|
| Turismo | 59 | 37,02 | 51,92 |
| Salud | 43 | 28,21 | 46,42 |
| Clima | 40 | 26,70 | 45,52 |
| Educacion | 301 | 26,65 | 46,89 |
| Tecnologia | 36 | 22,07 | 41,53 |
| Administracion | 249 | 19,93 | 39,92 |
| Derecho | 243 | 18,00 | 39,39 |

No se han publicado comparaciones con modelos de referencia en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: aproximadamente 5,5 GB en BF16/FP16, segun el autor; en cuantizaciones de 8 bits o 4 bits no se proporcionan cifras.
- GPUs recomendadas por el autor: RTX 3060, RTX 4060, T4 y A10 como minimo; cualquier GPU con al menos 6 GB de VRAM deberia poder cargar los pesos en BF16/FP16.
- Cabe en GPU de consumo: si, en RTX 3060/4060 y superiores con 6 GB o mas de VRAM.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiqueta `text-generation-inference` en el repo) y endpoints compatibles; no se documentan recetas para vLLM, llama.cpp u Ollama.
- Rendimiento: 22,6 frases/s reportadas por el autor; no se especifica la GPU utilizada para esa medicion ni la latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sarvam-1-hindi-marathi (este) | 2,52B | no disponible | Traduccion hi→mr full fine-tune | Apache 2.0 | Hugging Face |
| sarvamai/sarvam-1 (base) | 2,52B | no disponible | LLM causal indico generalista | no disponible en la informacion | Hugging Face |
| Modelos de traduccion indicos de 7B o mas | ≥7B | no disponible | Traduccion multilingue generica | variable | no disponible |

No se dispone de datos de rendimiento de los modelos alternativos en la informacion proporcionada, por lo que no es posible una comparacion cuantitativa de BLEU o COMET.

## Limitaciones y advertencias
- El modelo esta especializado exclusivamente en hindi → marathi; no se documenta calidad en la direccion inversa ni en otros pares de idiomas.
- Los benchmarks son autoinformados por el autor y no se han verificado de forma independiente; los resultados de BLEU en SacreBLEU (intl) son notablemente inferiores a los de flores200, lo que sugiere sensibilidad al tokenizador de evaluacion.
- El rendimiento cae en dominios especializados: derecho (18,00 BLEU) y administracion (19,93 BLEU) estan por debajo de turismo (37,02 BLEU), por lo que la traduccion juridica o administrativa requiere revision humana.
- Riesgo de alucinacion y de errores de concordancia en textos muy alejados del corpus de entrenamiento; el autor afirma ausencia de bucles de repeticion, pero no se aportan pruebas independientes.
- No se documenta la longitud de contexto soportada, lo que impide garantizar la traduccion de documentos largos sin truncamiento.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base `sarvamai/sarvam-1` debe verificarse por separado para confirmar que sus terminos son compatibles.
- El autor es un particular (`vennyvirtuoso`), no el desarrollador original Sarvam AI; no hay garantias de mantenimiento ni soporte.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/vennyvirtuoso/sarvam-1-hindi-marathi
- Modelo base: https://huggingface.co/sarvamai/sarvam-1
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
