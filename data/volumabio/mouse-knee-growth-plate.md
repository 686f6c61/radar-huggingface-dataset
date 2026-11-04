# VolumaBio/mouse-knee-growth-plate

## Resumen

VolumaBio/mouse-knee-growth-plate es un conjunto de checkpoints derivados de SAM 3.1 de Meta AI, especializados en la segmentación de la placa de crecimiento (growth plate) en secciones coronales de micro-CT de rodillas de ratón. El modelo resuelve un problema muy concreto de imagen médica preclínica: localizar y delimitar automáticamente la placa tibial para mediciones de grosor y seguimiento de osteoarthritis en modelos animales. Lo desarrolla VolumaBio, un laboratorio centrado en flujos de imagen ósea, y se publica como fine-tune de tipo LoRA sobre el modelo base facebook/sam3.1.

La relevancia actual reside en que demuestra un patrón de adaptación eficiente de modelos fundacionales de segmentación (SAM) a dominios muy específicos con pocos datos y sin reentrenar el backbone completo: solo se publican los tensores entrenados (LoRA de rango 16 en la atención del ViT, más cuello, codificador de fusión, decodificador y cabezas), lo que reduce el repositorio a 0,5 GB. El modelo no es de propósito general ni multilingüe: es una herramienta de investigación para un protocolo de escaneo concreto.

No se dispone de información sobre arquitectura interna más allá de que hereda la de SAM 3.1 (modelo de segmentación promptable con ViT y decodificador de máscaras), ni de parámetros totales, contexto o cuantizaciones, por lo que esos campos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fine-tune de SAM 3.1 (ViT + neck + fusion encoder + decoder + heads); LoRA rango 16 en atención del ViT |
| Parametros totales | no disponible (los checkpoints publicados contienen solo tensores entrenados: LoRA, neck, fusion encoder, decoder y heads) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en formato PyTorch `.pt`) |
| Idiomas soportados | no disponible; los prompts son texto en inglés (`growth plate`, `epiphysis`) |
| Licencia | SAM License (licencia `other`, `license_name: sam-license`) |
| Formato de pesos | PyTorch `.pt` (`band-s0.pt`, `band-s1.pt`, `band-s2.pt`) |

## Arquitectura y entrenamiento

El modelo parte de SAM 3.1 de Meta AI y aplica un fine-tune selectivo: LoRA de rango 16 sobre las capas de atención del ViT, más el entrenamiento del neck, el codificador de fusión, el decodificador y las cabezas de predicción. Los checkpoints publicados no incluyen los pesos base; deben cargarse sobre `sam3.1_multiplex.pt` obtenido de facebook/sam3.1 bajo la SAM License, mediante `model.build(ckpt=...)` del repositorio de VolumaBio.

El entrenamiento se realizó sobre secciones coronales de 31 escaneos de micro-CT de rodillas de ratón (vóxeles de 10,5 µm) procedentes de los escaneos de osteoarthritis del laboratorio Yao, incluido OA6-2RK: 460 secciones de entrenamiento, 58 de validación (4 escaneos adicionales) y 29 de test (2 escaneos más). Las etiquetas son líneas de corte trazadas por agentes de IA a partir de las dos caras de la placa; solo el escaneo de test OA8-19L fue revisado por un experto (corrigió 12 de 14 líneas y validó 2). Cada checkpoint corresponde a la mejor pérdida de validación de una ejecución de 3000 pasos, con tres semillas por objetivo. La receta recomendada combina las tres semillas de la variante "band" con umbral de detector 0,3, extracción de la línea de corte por la línea media entre las dos caras y voto de las tres regiones con abstención.

## Capacidades

- Segmentación promptable por texto: acepta el prompt `growth plate` para localizar la placa de crecimiento en secciones coronales de micro-CT de rodilla de ratón.
- Predicción de dos caras de la placa (proximal y distal) y derivación de una línea de corte a partir de la línea media entre ambas.
- Estimación de grosor de la placa con precisión de aproximadamente ±1 vóxel.
- Voto multi-semilla con abstención para robustecer la predicción y descartar semillas sin detección.
- Integración en flujos de trabajo de imagen médica preclínica (revisión humana o por agente de comprobación).
- No soporta tool calling, agentes multi-paso, razonamiento general, código, matemáticas, visión general ni audio; es exclusivamente un modelo de segmentación de dominio.
- Capacidades multilingües no disponibles: los prompts son términos en inglés.

## Casos de uso

- Medición automatizada del grosor de la placa de crecimiento en estudios de osteoarthritis en ratón: el modelo predice las caras de la placa y la línea de corte, y el grosor se deriva con precisión de ±1 vóxel, sustituyendo el trazado manual en series de cientos de secciones.
- Preetiquetado para revisión experta: el modelo genera la línea de corte como punto de partida que un investigador o un agente de comprobación valida, reduciendo el tiempo de anotación en flujos como el de Voluma para OA de ratón.
- Staging de osteoarthritis en producción preclínica: la receta de tres semillas con voto y abstención es la que usa el servicio de producción de Voluma, lo que permite procesar lotes de escaneos de forma reproducible.
- Control de calidad de escaneos: la ausencia de detección o la discrepancia entre semillas puede señalar secciones problemáticas (cortes en los extremos, hueso suelto) que requieren revisión.
- Análisis longitudinal de cohortes: al ser determinista y rápido sobre secciones 2D coronales, permite procesar series temporales de escaneos del mismo animal para medir cambios en la placa.
- Investigación metodológica en adaptación de SAM: los checkpoints y la receta publicada permiten reproducir y comparar estrategias de fine-tune (LoRA, prompt de banda frente a prompt de región) sobre un dominio médico concreto.
- Docencia y validación de pipelines de segmentación médica: sirve como caso de referencia de un fine-tune de SAM 3.1 con licencia restrictiva y datos no públicos.

## Benchmarks y rendimiento

La métrica es la distancia mediana por sección entre la línea de corte de la etiqueta y la línea implícita en la predicción, en µm; una sección sin predicción puntúa 1050 µm.

| Configuracion | OA8-19L (test, lineas de experto) | OA6-9RK (test, lineas de agente) | 4 escaneos de validacion |
|---|---|---|---|
| region, por semilla | 33,4 ± 5,5 | 53,5 ± 38,0 | 55 / 54 / 32 |
| region, voto de 3 semillas | 33,8 | 33,1 | 34 |
| band, por semilla | 16,1 ± 2,1 | 20,0 ± 3,4 | 39 / 26 / 32 |
| band, voto de 3 semillas (recomendado) | 16,4 | 18,7 | 33 |

El suelo de la etiqueta (una banda perfecta a través de la misma extracción de línea) es de unos 11 µm. Las dos caras de la banda quedan a 1-2 vóxeles de las caras trazadas (error mediano de 11-26 µm por escaneo y semilla). El umbral 0,3, la línea media y el voto se fijaron en validación antes de puntuar test; la regla de caras se revisó después del test y las caras simples puntúan mejor en validación (33,9 frente a 34,6 µm).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende de los pesos base de SAM 3.1 (`sam3.1_multiplex.pt`), que no se publican en este repositorio.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: inferencia mediante el código de VolumaBio (`predict.py`, `band_to_region.py`, `vote.py`) sobre PyTorch, cargando los pesos base de SAM 3.1 con `model.build(ckpt=...)`; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VolumaBio/mouse-knee-growth-plate | no disponible (solo tensores de fine-tune) | no disponible | 16,4 µm (test OA8-19L, voto de 3 semillas) | SAM License | Pesos de fine-tune públicos; base SAM 3.1 requerida |
| facebook/sam3.1 | no disponible | no disponible | no disponible para esta tarea sin fine-tune | SAM License | Público |
| SAM 2 (Meta) | no disponible | no disponible | no disponible en esta tarea | Licencia de Meta | Público |
| Otros fine-tunes de SAM para imagen médica | no disponible | no disponible | no disponible | variable | variable |

No se dispone de datos de benchmarks de los modelos alternativos en esta tarea concreta, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Entrenado con los escaneos y el escáner de un solo laboratorio; sin probar en otros protocolos, edades o resoluciones.
- Con el umbral por defecto del detector (0,5), una semilla de banda no devuelve nada en aproximadamente una de cada veinte secciones; con 0,3 ninguna de las 261 predicciones de sección en los seis escaneos puntuados quedó vacía, pero un escaneo nuevo puede tener secciones vacías y el voto con abstención omite esa semilla.
- El conjunto de test (2 escaneos) y validación (4 escaneos) es muy pequeño; en un escaneo de validación (OA8-21L) el voto de banda es peor que el de región (52,5 frente a 38 µm).
- En secciones de los extremos donde la placa cubre solo parte de la sección, el modelo puede trazar una línea de ancho completo a través de otro hueso, o marcar un hueso redondo separado que la extracción de línea une a la placa.
- El grosor derivado de la banda es bueno con aproximadamente ±1 vóxel y sale alrededor de un vóxel más grueso que el trazado donde la placa es fina.
- Las etiquetas de entrenamiento, salvo el test OA8-19L revisado por experto, son trazas de agentes de IA, no anotaciones humanas.
- Uso previsto exclusivamente de investigación: no para uso clínico, ni para hueso humano ni de otras especies.
- Licencia SAM: los checkpoints son obras derivadas de SAM 3.1 y se distribuyen bajo la SAM License; cualquier redistribución debe hacerse bajo los mismos términos con copia de la licencia, la investigación que los use debe reconocer el uso de SAM y se aplican las restricciones de uso de las secciones §1.b.iii-v.
- Los datos de escaneo no son públicos y este repositorio no contiene datos de escaneo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VolumaBio/mouse-knee-growth-plate
- Modelo base SAM 3.1: https://huggingface.co/facebook/sam3.1
- Repositorio de código y receta de entrenamiento: https://github.com/voluma-bio/voluma/tree/main/training/plate-finetune
- Licencia SAM: archivo `LICENSE` del repositorio del modelo
