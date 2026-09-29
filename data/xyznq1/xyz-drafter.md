# xyznq1/xyz-drafter

## Resumen

xyz v1.2 drafter es una cabeza de borrador (draft head) de una sola capa desarrollada por xyznq1 para acelerar la inferencia del modelo PrismML Ternary Bonsai 2 27B en su variante cuantizada `PTQ1_0`. No es un modelo de lenguaje autónomo: lee los estados ocultos del modelo base y propone cuatro tokens por ronda, que el propio modelo base verifica uno a uno. Según el autor, el resultado es exactamente el mismo texto que produciría el modelo por sí solo, pero a mayor velocidad.

El artefacto tiene 676.395.520 parámetros y se distribuye en formato GGUF con licencia Apache-2.0. Su diseño sigue la línea de EAGLE-3 (arXiv:2503.01840) y su única función es la decodificación especulativa, por lo que su relevancia no está en capacidades nuevas sino en el coste por token: el autor reporta 139,5 tokens/s con su fork `xyz-llama` y 144,2 tokens/s con `xyz-engine` sobre una RTX 4070 Ti SUPER de 16 GB y unos 161.000 tokens de contexto.

Se trata de un proyecto de nicho: cero descargas y cero likes en el momento de la ficha, sin benchmarks de calidad publicados y con un requisito de despliegue estricto (solo funciona con el fork `xyz-llama` y solo con el fichero `Ternary-Bonsai-2-27B-PTQ1_0.gguf`). Su interés práctico depende por completo de que se use ese modelo base concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza de borrador de una sola capa acoplada a un transformer; diseño inspirado en EAGLE-3. No es un modelo autónomo |
| Parametros totales | 676.395.520 (~676 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible como propiedad propia; la hereda del modelo base. En las pruebas del autor se operó con aproximadamente 161.000 tokens de contexto |
| Tipos de cuantizacion | GGUF (el fichero distribuido es GGUF). El modelo base asociado emplea cuantización ternaria `PTQ1_0` |
| Idiomas soportados | No disponible (utiliza el vocabulario del modelo base) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`xyz-v1.2-drafter.gguf`) |

## Arquitectura y entrenamiento

La pieza es una cabeza de borrador de una sola capa que se engancha al modelo base: consume sus estados ocultos y el vocabulario del propio modelo, y propone cuatro tokens por ronda de decodificación especulativa. Cada token propuesto se verifica contra el modelo base, de modo que la distribución final de salida no se altera. El autor indica que el diseño sigue EAGLE-3 (arXiv:2503.01840) y que tanto `xyz v1.2` como sus datos de entrenamiento son propios; no se publica el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

El fichero incorpora filas de la cabeza de salida (*output head*) del modelo Ternary Bonsai 2 27B de PrismML, que a su vez procede de `Qwen/Qwen3.8-27B` (Apache-2.0). Esta dependencia del vocabulario y de los pesos de salida del base explica que el drafter solo sea funcional con un único GGUF concreto y que no pueda reutilizarse con otros modelos. No se documentan innovaciones adicionales más allá del esquema de borrador y verificación.

## Capacidades

- Decodificación especulativa: genera cuatro tokens candidatos por ronda, que el modelo base valida. No produce texto por sí solo.
- Fidelidad de salida: según el autor, el texto resultante es idéntico al que escribiría el modelo base sin el drafter.
- Integración con el vocabulario y los estados ocultos de Ternary Bonsai 2 27B (`PTQ1_0`).
- Motor propio: funciona con `xyz-llama` (fork de llama.cpp) y con `xyz-engine`; no funciona con llama.cpp estándar.
- Generación de texto, razonamiento, código, matemáticas, visión o audio: no son capacidades propias del drafter; dependen íntegramente del modelo base.
- Tool calling y function calling: no son capacidades del drafter; se heredan del modelo base si este las soporta (no verificado en la información disponible).
- Soporte de agentes y razonamiento multi-paso: no aplica al drafter, que únicamente reduce la latencia por token del base.
- Capacidades multilingües: no declaradas; quedan determinadas por el vocabulario y el entrenamiento del modelo base.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Aceleración de inferencia local de Ternary Bonsai 2 27B: el drafter aporta 2,82 tokens por ronda verificada, lo que eleva el throughput hasta 139,5 tokens/s con `xyz-llama` sobre una GPU de 16 GB; es el escenario para el que se diseñó.
- Asistente conversacional de baja latencia con contexto largo: las pruebas se hicieron con aproximadamente 161.000 tokens de contexto, de modo que la aceleración se mantiene en diálogos multi-turno con documentación extensa cargada en el prompt.
- Autocompletado de código en un IDE local: al reducir el tiempo entre tokens, mejora la percepción de fluidez en sugerencias de fragmentos cortos generados por el modelo base.
- Generación por lotes de documentos largos: en procesos offline donde se generan decenas de miles de tokens, la ganancia de throughput se traduce directamente en horas de GPU ahorradas.
- Flujos de agente multi-paso: cuando cada turno exige una generación corta, la latencia por turno domina el tiempo total; el drafter la reduce sin cambiar la salida del base.
- Evaluación comparativa de motores de inferencia: permite hacer A/B entre `xyz-llama` (139,5 tokens/s) y `xyz-engine` (144,2 tokens/s) manteniendo el mismo texto generado.
- Despliegue en estaciones de trabajo con una sola GPU de consumo: el conjunto base más drafter se ejecutó en una RTX 4070 Ti SUPER de 16 GB, sin necesidad de hardware de datacenter.
- Experimentación con decodificación especulativa basada en EAGLE-3: sirve como implementación de referencia para estudiar cabezas de borrador acopladas a un modelo cuantizado de forma agresiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible, y en sentido estricto no aplicarían: el drafter no altera la salida del modelo base. Los únicos datos publicados son de velocidad:

| Prueba | Motor | Hardware | Contexto | Configuracion de muestreo | Volumen | Velocidad | Tokens por ronda |
|---|---|---|---|---|---|---|---|
| 10 generaciones | xyz-llama (fork de llama.cpp) | RTX 4070 Ti SUPER (16 GB) | ~161.000 tokens | temperature 1.0, top-k 20, top-p 0.95 | 11.964 tokens | 139,5 tokens/s | 2,82 |
| 10 generaciones | xyz-engine | RTX 4070 Ti SUPER (16 GB) | ~161.000 tokens | temperature 1.0, top-k 20, top-p 0.95 | 11.964 tokens | 144,2 tokens/s | 2,82 |

El autor indica que el texto generado es el mismo en ambos motores. No se aportan datos de latencia por token (time to first token, inter-token latency) ni comparaciones contra el modelo base sin drafter.

## Requisitos de hardware

- Peso del drafter: el repositorio ocupa 0,3 GB en formato GGUF. Como referencia de cálculo, 676 M de parámetros en FP16 equivaldrían a unos 1,4 GB, pero el artefacto distribuido está cuantizado y es más pequeño.
- Requisito principal: el drafter no es utilizable de forma aislada; hay que cargar además el modelo base Ternary Bonsai 2 27B en `PTQ1_0`, que es el que consume la mayor parte de la memoria.
- VRAM: el conjunto completo (base más drafter) se ejecutó correctamente en una RTX 4070 Ti SUPER de 16 GB con aproximadamente 161.000 tokens de contexto.
- GPU de consumo: sí cabe en tarjetas de 16 GB. No hay datos publicados para tarjetas de 8, 12 o 24 GB.
- GPU de datacenter: no hay datos de rendimiento del drafter sobre A100, H100 u otras; el cuello de botella seguiría siendo el modelo base.
- Opciones de despliegue: `xyz-llama` (fork de llama.cpp de xyznq1) de forma obligatoria; llama.cpp estándar no lo carga. El zip de la release de Windows ya incluye el drafter en `models\`, y la compilación desde fuente usa `scripts/xyz-serve.sh`, que descarga el drafter y el modelo en el primer arranque. También existe `xyz-engine`.
- Compatibilidad con otros motores: no hay evidencia de soporte en vLLM, Ollama, TGI o llama.cpp estándar.
- Latencia y throughput: 139,5 tokens/s con `xyz-llama` y 144,2 tokens/s con `xyz-engine` sobre 11.964 tokens generados en 10 generaciones, con 2,82 tokens aceptados por ronda.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| xyz v1.2 drafter (xyznq1) | Cabeza de borrador para decodificación especulativa | 676 M | No disponible (heredado del base; ~161.000 en las pruebas) | Apache-2.0 | HuggingFace y GitHub | Solo con `Ternary-Bonsai-2-27B-PTQ1_0.gguf` y el fork `xyz-llama` |
| EAGLE-3 (diseño de referencia) | Cabeza de borrador | No disponible | No disponible | No disponible en la información proporcionada | Paper arXiv:2503.01840 | Referencia metodológica declarada por el autor; no se verifica disponibilidad de pesos para este modelo base |
| PrismML Ternary Bonsai 2 27B (`PTQ1_0`) | Modelo de lenguaje base, cuantización ternaria | 27.000 M (aproximado, según el nombre del modelo) | No disponible | Apache-2.0 | HuggingFace (`prism-ml/Ternary-Bonsai-2-27B-gguf`) | Es el modelo que el drafter acelera; sin él el drafter no sirve |
| Decodificación especulativa con modelo borrador independiente en llama.cpp | Patrón de despliegue alternativo | Variable según el borrador | El del modelo base | La del borrador elegido | Amplia | No hay datos de compatibilidad con Ternary Bonsai 2 27B ni cifras comparables publicadas |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no puede usarse para generar texto, razonar, escribir código ni responder preguntas por sí solo.
- Dependencia de un fork concreto: llama.cpp estándar no carga el fichero; es obligatorio usar `xyz-llama` (o `xyz-engine`).
- Compatibilidad cerrada: solo funciona con `Ternary-Bonsai-2-27B-PTQ1_0.gguf`, porque lee sus estados ocultos y emplea su vocabulario.
- Sesgos y alucinación: al no alterar la salida, hereda íntegramente los sesgos, errores y alucinaciones del modelo base. No se han publicado evaluaciones de sesgo para este drafter.
- Idiomas: no se declara ningún conjunto de idiomas soportados; el comportamiento lingüístico queda determinado por el modelo base.
- Licencia: Apache-2.0, pero el fichero incorpora filas de la cabeza de salida de Ternary Bonsai 2 27B (PrismML, Apache-2.0), que a su vez procede de `Qwen/Qwen3.8-27B` (Apache-2.0). Conviene revisar y mantener las atribuciones correspondientes en un uso comercial.
- Validación comunitaria nula: cero descargas y cero likes en el momento de la ficha, sin resultados de terceros que reproduzcan las cifras de velocidad.
- Trazabilidad limitada: el canal de contacto indicado es una cuenta de Instagram, sin repositorio de issues ni proceso formal de soporte documentado.
- Dependencia de artefactos externos: el GGUF del modelo base se descarga aparte, de modo que la reproducibilidad depende de que ese fichero siga disponible.
- Integridad del fichero: el autor publica el SHA256 `d65671c364ae21a52fd20368393a760dbdd75f532642eab5d1cd600bdad83ac4`; se recomienda verificarlo antes de desplegar.
- Sensibilidad a la configuración: las cifras de 2,82 tokens por ronda se obtuvieron con temperature 1.0, top-k 20 y top-p 0.95; otros valores de muestreo alterarán la tasa de aceptación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xyznq1/xyz-drafter
- Repositorio GitHub del drafter: https://github.com/xyznq1/xyz-drafter
- Fork de llama.cpp requerido (`xyz-llama`): https://github.com/xyznq1/xyz-llama
- Modelo base (PrismML Ternary Bonsai 2 27B, GGUF): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Paper de referencia del diseño (EAGLE-3): https://arxiv.org/abs/2503.01840
- Contacto indicado por el autor: https://www.instagram.com/xyz_nq1/

Nota: el resto de resultados devueltos por la búsqueda web (draftai.cloud, draftaid.io, benchlm.ai, drafterinc.com) corresponden a productos y servicios sin relación con este modelo y no se incluyen como enlaces relevantes.
