# uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft5600-grpo1320-lora

## Resumen

`uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft5600-grpo1320-lora` es un adaptador LoRA publicado por el usuario uygarkurt sobre el modelo base `Qwen/Qwen2.5-0.5B-Instruct`. No es un modelo completo: el repositorio contiene únicamente pesos de adaptador en formato PEFT/safetensors que deben cargarse sobre el modelo base original de Qwen. Su objetivo es especializar un modelo de 0,5 mil millones de parámetros en generación estructurada de llamadas a herramientas (tool calling) y, de forma explícita, en la abstención cuando el conjunto de herramientas ofrecido no es relevante para la consulta del usuario.

El entrenamiento es en dos etapas sobre el dataset `uygarkurt/xlam-tool-calling-mixed`: primero 5.600 actualizaciones de ajuste supervisado (SFT, 0,9 h) y después 1.320 actualizaciones de Group Relative Policy Optimization (GRPO, 0,7 h), partiendo del adaptador SFT del mismo autor. La innovación declarada es el uso de RL para reforzar dos comportamientos simultáneos: emitir la llamada correcta y no inventar llamadas cuando las herramientas no aplican. Es relevante ahora como ejemplo reproducible de pipeline SFT + GRPO de coste muy bajo (1,6 h de entrenamiento declaradas) para investigar function calling en modelos pequeños.

El repositorio no declara licencia, solo soporta inglés, no tiene descargas ni likes en el momento de la consulta y no publica información sobre longitud de contexto, rango del LoRA ni composición detallada del dataset. Sus resultados en capacidades generales son bajos (MMLU 39,25 %, MATH-500 17,40 %, IFEval 31,98 %), por lo que debe evaluarse estrictamente como especialista en tool calling y no como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA entrenado mediante PEFT |
| Parametros totales | 0,5 mil millones en el modelo base; el adaptador añade un número de parámetros entrenables no especificado |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; el adaptador se distribuye en safetensors sin cuantizar (la cuantización requeriría fusionar el adaptador con el modelo base y convertir) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible (el repositorio del adaptador no declara licencia; debe consultarse la del modelo base) |
| Formato de pesos | safetensors, adaptador LoRA PEFT (`library_name: peft`) |
| Modelo base | Qwen/Qwen2.5-0.5B-Instruct |
| Dataset de entrenamiento | uygarkurt/xlam-tool-calling-mixed |
| Etapas de entrenamiento | 5.600 actualizaciones SFT + 1.320 actualizaciones GRPO |
| Tiempo de entrenamiento declarado | 1,6 h en total (SFT 0,9 h + GRPO 0,7 h), sin carga de modelo ni evaluación |
| Tamaño del repositorio | 0,0 GB (redondeado) |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-25T22:12:32Z |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only denso de 0,5 mil millones de parámetros. El repositorio no documenta el rango del LoRA, las capas objetivo ni el número de parámetros entrenables; lo que sí se especifica es que se trata de un adaptador PEFT que se carga sobre el modelo base y que el adaptador SFT previo no es necesario de forma separada, ya que las dos etapas están acumuladas en estos pesos.

El entrenamiento se realizó con Post-Training Lab y consta de dos fases sobre el mismo dataset mixto de tool calling: 5.600 actualizaciones de SFT y, a continuación, 1.320 actualizaciones de GRPO partiendo de ese adaptador SFT. La fase de RL persigue explícitamente dos objetivos: precisión en la llamada estructurada y abstención cuando las herramientas ofrecidas son irrelevantes. No se han publicado el número de tokens de entrenamiento, la composición exacta del dataset, la función de recompensa ni detalles de configuración del RL, por lo que no es posible reproducir el entrenamiento solo con la información de la model card.

## Capacidades

- Generación de texto conversacional en inglés sobre el modelo base Qwen2.5-0.5B-Instruct.
- Tool calling estructurado: emisión de llamadas a funciones con nombre de función y argumentos en formato estructurado (evaluado con subconjuntos xLAM y BFCL-v3 de un solo turno).
- Abstención ante herramientas irrelevantes: el modelo está entrenado para no emitir una llamada cuando ninguna de las funciones ofrecidas resuelve la consulta (métricas Relevance / Irrelevance).
- Ajuste fino con refuerzo (GRPO) orientado a la corrección exacta de la llamada, no solo a la sintaxis.
- Conversación de un solo turno evaluada; no hay evidencia publicada sobre razonamiento multi-paso ni sobre uso de agentes en varios turnos.
- Capacidades generales presentes pero débiles: MMLU 39,25 %, MATH-500 17,40 %, IFEval 31,98 %.
- Sin soporte declarado de visión, audio, modo thinking ni otras modalidades.

## Casos de uso

- **Enrutador de herramientas en arquitecturas de cascada**: colocado delante de un LLM mayor, el adaptador decide si la consulta requiere una llamada a función y genera el JSON de la llamada; al tener 0,5B de parámetros, el coste por consulta descartada es mínimo y solo las peticiones que requieren razonamiento escalan al modelo grande.
- **Filtro de abstención previo a la ejecución de herramientas**: con Relevance del 83,33 % e Irrelevance del 51,87 %, puede usarse como primera barrera que marque llamadas dudosas para revisión humana o para un segundo modelo, evitando ejecutar funciones con argumentos inventados en flujos sensibles.
- **Extracción y normalización de argumentos en backoffice**: generación de JSON de llamadas a APIs internas (consultas de pedidos, altas de tickets) en un servicio con latencia baja, siempre con validación de esquema posterior y sin permisos de escritura directos.
- **Despliegue en el borde o en local**: tras fusionar el adaptador con el modelo base y cuantizarlo, el conjunto cabe en unos pocos cientos de MB, lo que permite ejecutarlo en CPU, en portátiles sin GPU dedicada o en dispositivos empotrados para asistentes de configuración y domótica sin conexión.
- **Investigación reproducible de RL para tool calling**: sirve como baseline de comparación entre SFT puro y SFT + GRPO, con la ventaja de que el ciclo completo declarado cuesta 1,6 h de cómputo y el dataset y el código están publicados.
- **Test de regresión de function calling en CI**: integrado en una suite que evalúe subconjuntos tipo BFCL de un solo turno, permite detectar regresiones al cambiar prompts, esquemas de herramientas o versiones del adaptador antes de desplegar.
- **Punto de partida para fine-tuning de dominio**: al ser un adaptador LoRA, se puede continuar el entrenamiento con un conjunto reducido de APIs propias (por ejemplo, soporte interno) sin tocar los pesos del modelo base.
- **Generación de cargas útiles estructuradas en agentes ligeros**: producción de objetos JSON para invocar herramientas en asistentes de documentación o de operaciones, con el esquema de la herramienta como contexto y validación estricta en el servidor.

## Benchmarks y rendimiento

Datos publicados por el autor. Todas las puntuaciones son porcentajes. La primera fila corresponde al adaptador SFT usado para inicializar el GRPO; la segunda, al adaptador final SFT + GRPO.

| Checkpoint | Etapa | MMLU | MATH-500 | IFEval | xLAM ETC | xLAM FNA | BFCL single-turn FC | Relevance | Irrelevance | Tiempo (h) |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Adaptador SFT inicial | SFT 5.600 | 39,42 | 18,00 | 31,24 | 77,61 | 97,46 | 53,04 | 83,33 | 49,46 | 0,9 |
| SFT + GRPO (este adaptador) | GRPO 1.320 | 39,25 | 17,40 | 31,98 | 78,22 | 97,07 | 56,48 | 83,33 | 51,87 | 1,6 |

Notas de evaluación publicadas por el autor: xLAM ETC es exactitud exacta de la llamada a herramienta y xLAM FNA es exactitud del nombre de la función; ambas se calculan sobre el holdout de solo llamadas (2.287 ejemplos evaluados, 700 omitidos), no sobre el split de test del dataset mixto. BFCL single-turn FC agrega subconjuntos seleccionados de BFCL-v3 de un solo turno, y Relevance/Irrelevance corresponden a los subconjuntos de relevancia seleccionados; son agregados propios del estudio. IFEval usa exactitud estricta a nivel de prompt. Las evaluaciones xLAM se hicieron con scripts propios de Post-Training Lab.

Lectura de los datos: el paso de SFT a SFT + GRPO mejora BFCL single-turn FC (+3,44 puntos), ETC (+0,61) e Irrelevance (+2,41), mientras retrocede ligeramente en MMLU (−0,17), MATH-500 (−0,60) y FNA (−0,39). No hay resultados de benchmarks de terceros ni comparaciones con otros adaptadores.

## Requisitos de hardware

- **VRAM estimada para el adaptador solo**: mínima; el repositorio reporta 0,0 GB redondeados, coherente con pesos LoRA de pocos MB, aunque el tamaño exacto no se especifica.
- **VRAM estimada para el conjunto (base + adaptador fusionado)**: en BF16/FP16 unos 1 GB de pesos más caché KV y activaciones, en torno a 1,5-2 GB en la práctica; en INT8 aproximadamente 0,5-0,7 GB; en INT4 aproximadamente 0,3-0,5 GB. Son estimaciones a partir del tamaño del modelo base, no medidas publicadas.
- **GPU recomendadas**: cualquier GPU consumer con 2 GB o más de VRAM es suficiente (RTX 3060, RTX 4060, GTX 1650, T4). No requiere A100 ni H100; usarlas solo tendría sentido para servir muchas réplicas en paralelo.
- **CPU**: la inferencia en CPU es viable tras fusionar y cuantizar, dado el tamaño del modelo; no se han publicado cifras de tokens por segundo.
- **Opciones de despliegue**: `transformers` + `peft` (carga directa del adaptador), vLLM (soporte de adaptadores LoRA), TGI, y llama.cpp/Ollama/LM Studio tras fusionar el adaptador con el modelo base y convertir a GGUF.
- **Latencia y throughput**: no se han publicado medidas. El autor solo reporta tiempos de entrenamiento (0,9 h de SFT y 0,7 h de GRPO).
- **Requisito práctico**: es imprescindible cargar el adaptador sobre `Qwen/Qwen2.5-0.5B-Instruct`; aplicar estos pesos sobre otra variante del modelo base invalidaría el resultado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (SFT + GRPO) | 0,5B (base) + LoRA | no disponible | MMLU 39,25 · ETC 78,22 · BFCL single-turn 56,48 · Irrelevance 51,87 | no disponible | HuggingFace, 2026-10-25, 0 descargas |
| Adaptador SFT 5.600 del mismo autor | 0,5B (base) + LoRA | no disponible | MMLU 39,42 · ETC 77,61 · BFCL single-turn 53,04 · Irrelevance 49,46 | no disponible | HuggingFace |
| Qwen2.5-0.5B-Instruct (modelo base, sin adaptador) | 0,5B | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion (consultar ficha del modelo base) | HuggingFace, oficial de Qwen |
| Qwen2.5-1.5B-Instruct / 3B-Instruct (alternativas de la misma familia para tool calling) | 1,5B / 3B | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | HuggingFace, oficial de Qwen |

La comparación directa más informativa es contra el adaptador SFT del mismo autor, porque comparte base, dataset y metodología de evaluación: el GRPO aporta la mejora en formato de llamada (BFCL) y en abstención, a costa de un retroceso pequeño en conocimiento general. Frente a modelos mayores de la familia Qwen2.5 no hay datos comparables publicados en esta ficha, y las métricas del autor son agregados propios no equivalentes a los leaderboards públicos.

## Limitaciones y advertencias

- **Abstención poco fiable**: Irrelevance del 51,87 % significa que aproximadamente la mitad de los casos en los que debería no llamar a ninguna herramienta no se resuelven correctamente. No es apto como único guardarraíl en producción.
- **Precisión exacta de la llamada moderada**: ETC del 78,22 % frente a FNA del 97,07 % indica que el fallo se concentra en los argumentos, no en el nombre de la función; requiere validación de esquema y de valores antes de ejecutar.
- **Rendimiento general bajo**: MMLU 39,25 %, MATH-500 17,40 % e IFEval 31,98 % lo sitúan lejos de un uso como asistente general o para razonamiento.
- **Idioma**: solo se declara inglés; no hay evidencia de comportamiento en castellano ni en otros idiomas.
- **Contexto desconocido**: no se publica la longitud de contexto efectiva, por lo que no se puede garantizar el manejo de prompts largos con muchos esquemas de herramientas.
- **Evaluación limitada a un solo turno**: BFCL y xLAM se evalúan en subconjuntos de un solo turno; no hay datos de conversaciones multi-turno ni de planificación de varios pasos.
- **Licencia no declarada**: el adaptador no especifica licencia, lo que bloquea cualquier decisión de uso comercial hasta aclararlo con el autor y verificar la licencia del modelo base.
- **Sin validación de la comunidad**: 0 descargas y 0 likes, con fecha de creación 2026-10-25; no hay informes independientes de calidad, sesgos o seguridad.
- **Riesgo de alucinación**: al ser un modelo de 0,5B especializado en generar JSON, puede inventar nombres de funciones o valores de argumentos plausibles; conviene restringir el conjunto de herramientas en el prompt y validar contra un esquema estricto.
- **Sesgos**: no se ha publicado ningún análisis de sesgos, toxicidad o alineación; se heredan los del modelo base, no documentados aquí.
- **Métricas no comparables**: los agregados de BFCL, Relevance e Irrelevance son propios del estudio y el holdout de xLAM excluye 700 ejemplos, por lo que no deben compararse directamente con cifras de leaderboards públicos.
- **Reproducibilidad parcial**: faltan hiperparámetros, rango del LoRA, composición del dataset y función de recompensa, así que el entrenamiento no se puede replicar solo con la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft5600-grpo1320-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/uygarkurt/xlam-tool-calling-mixed
- Adaptador SFT previo: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft5600-lora
- Repositorio de entrenamiento (Post-Training Lab): https://github.com/uygarkurt/post-training-lab
