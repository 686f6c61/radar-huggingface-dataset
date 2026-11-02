# Terrano09/AVID-EPJ-Baseline-Models-and-Data

## Resumen

AVID-EPJ-Baseline-Models-and-Data no es un modelo de lenguaje, sino un repositorio de artefactos de investigación para corrección de errores cuánticos (QEC). Lo publica el usuario Terrano09 en HuggingFace bajo licencia MIT y contiene checkpoints calibrados de un decodificador de síndrome basado en programación dinámica exacta (denominado `AVID-Joint-DP-MAP`), bancos de pesos cuantizados en Q7.8 (enteros con signo de 16 bits), contratos de arquitectura congelados (`A01–A09`) y conjuntos de datos canónicos de síndromes para códigos de superficie CSS rotados con distancias `d=3` y `d=5`.

El problema que aborda es la decodificación de síndromes en códigos de superficie bajo regímenes de ruido no estacionarios (hotspots de TLS, crosstalk ZZ, deriva de frontera y estrés combinado). El repositorio incluye una comparativa de tasa de error lógico (LER) entre varias líneas base (`B0` BP estático, `B1` L-BFGS marginal, `B2` PID observable, `B3` tracker de covarianza, `B4` BP oráculo) y la propuesta AVID.

Es relevante ahora porque empaqueta pesos listos para hardware (bancos Q7.8 para un registro `weight_map_reg.sv`) y paquetes de síndrome en formato binario little-endian de 64 bits para AXI4-Stream, lo que facilita la integración en flujos FPGA de decodificación cuántica. El tamaño del repositorio es de 0,0 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Decodificador de síndrome por programación dinámica exacta sobre `2^m` estados (AVID-Joint-DP-MAP); no es un transformer |
| Parámetros totales | no disponible (21 parámetros físicos de ruido calibrados por régimen, según la model card) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantización | Q7.8 con signo, 16 bits, para bancos de pesos LLR |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | MIT |
| Formato de pesos | JSON (`avid_joint_dp_checkpoints.json`), NPZ (`q78_weight_banks.npz`), binario (`syndrome_packets_v1.bin`) |

## Arquitectura y entrenamiento

La model card describe una arquitectura de decodificación MAP conjunta por programación dinámica exacta sobre `2^m` estados, con calibración de 21 parámetros físicos de ruido por régimen. El repositorio congela contratos de arquitectura (`A01–A09`) en YAML y genera tablas de estabilizadores CSS y de Tanner. No se especifica el número de tokens de entrenamiento ni la composición del dataset, porque no se trata de un modelo entrenado con corpus textual: los artefactos son checkpoints calibrados y bancos de pesos derivados de esa calibración.

Los datos incluidos son síndromes canónicos `(s_X, s_Z)` para códigos de superficie CSS rotados `d=3` y `d=5` en cinco regímenes de ruido, junto con un formato binario de paquetes de síndrome pensado para AXI4-Stream. La innovación técnica destacable es la orientación a hardware: pesos LLR cuantizados en Q7.8 listos para un registro SystemVerilog (`weight_map_reg.sv`), lo que permite desplegar el decodificador en FPGA sin conversión adicional.

## Capacidades

- Decodificación de síndromes de códigos de superficie CSS rotados en distancias `d=3` y `d=5`.
- Programación dinámica exacta sobre `2^m` estados para el cálculo de verosimilitud conjunta de síndrome.
- Calibración de 21 parámetros físicos de ruido por régimen no estacionario.
- Generación de bancos de pesos LLR cuantizados en Q7.8 (16 bits con signo) para síntesis hardware.
- Empaquetado de síndromes en binario little-endian de 64 bits compatible con AXI4-Stream.
- Soporte de cinco regímenes de ruido: estacionario, hotspot TLS q4/q5, crosstalk ZZ, deriva de frontera y estrés combinado.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni capacidades multilingües.

## Casos de uso

- Decodificación en tiempo real en FPGA: los bancos Q7.8 de `q78_weight_banks.npz` se cargan directamente en `weight_map_reg.sv`, lo que evita la conversión de punto flotante a entero en la ruta crítica.
- Evaluación comparativa de decodificadores QEC: los cinco regímenes de ruido permiten medir LER frente a líneas base BP, L-BFGS, PID y tracker de covarianza con la misma entrada de síndromes.
- Validación de códigos de superficie `d=3` y `d=5`: los datasets canónicos CSS sirven como referencia reproducible para verificar nuevas implementaciones de decodificadores.
- Integración en pipelines de simulación QEC: los paquetes binarios AXI4-Stream permiten inyectar síndromes en un banco de pruebas hardware sin recompilar el modelo.
- Investigación en ruido no estacionario: los 21 parámetros calibrados por régimen permiten estudiar la deriva de frontera y el crosstalk ZZ de forma controlada.
- Prototipado de decodificadores MAP exactos: los checkpoints JSON documentan la calibración y sirven como oráculo de referencia para aproximaciones más rápidas.

## Benchmarks y rendimiento

La model card publica una tabla de tasa de error lógico (LER) con entrada compartida en cinco regímenes. Se reproduce a continuación tal cual:

| Régimen de ruido | B0 BP estático | B1 L-BFGS marginal | B2 PID observable | B3 tracker de covarianza | AVID Joint-DP MAP | B4 BP oráculo |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| `R1_stationary_baseline` | 0,0420 | 0,0420 | 0,0420 | 0,0420 | **0,0420** | 0,0420 |
| `R2_tls_hotspot_q4_q5` | 0,0615 | 0,0615 | 0,0615 | 0,0615 | **0,0615** | 0,0615 |
| `R3_zz_crosstalk_burst` | 0,1904 | 0,1904 | 0,1904 | 0,1904 | **0,1904** | 0,1904 |
| `R4_boundary_drift` | 0,0620 | 0,0620 | 0,0620 | 0,0620 | **0,0620** | 0,0620 |
| `R5_combined_stress` | 0,0908 | 0,0908 | 0,0908 | 0,0908 | **0,0908** | 0,0884 |

Observación: en los cinco regímenes, todas las líneas base y AVID presentan el mismo valor de LER salvo en `R5_combined_stress`, donde el oráculo BP (`B4`) obtiene 0,0884 frente a 0,0908 del resto. La tabla no incluye intervalos de confianza ni número de muestras por régimen.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no es un modelo neuronal. El despliegue previsto es en lógica programable (FPGA) o simulación.
- GPU recomendadas: no disponible; no se documenta aceleración por GPU.
- Compatibilidad con GPU de consumo: no disponible; el destino declarado es hardware FPGA mediante `weight_map_reg.sv`.
- Opciones de despliegue: carga de `q78_weight_banks.npz` en registros SystemVerilog, inyección de `syndrome_packets_v1.bin` por AXI4-Stream y ejecución de los checkpoints JSON en un entorno de simulación.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

La comparativa relevante no es con modelos de lenguaje, sino con las líneas base de decodificación incluidas en la propia model card:

| Decodificador | Tipo | LER en `R5_combined_stress` | Licencia | Disponibilidad |
|---|---|---|---|---|
| AVID Joint-DP MAP | Programación dinámica exacta `2^m` estados | 0,0908 | MIT | Pesos y checkpoints en el repositorio |
| B0 BP estático | Belief propagation | 0,0908 | MIT (en el repositorio) | Incluido como referencia |
| B1 L-BFGS marginal | Optimización marginal | 0,0908 | MIT (en el repositorio) | Incluido como referencia |
| B4 BP oráculo | Belief propagation con información privilegiada | 0,0884 | MIT (en el repositorio) | Incluido como referencia |

No se dispone de comparación con decodificadores externos (por ejemplo, MWPM de terceros) en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, código ni responde a instrucciones; cualquier uso en ese sentido es inadecuado.
- Los resultados de LER de la tabla son idénticos entre AVID y las líneas base en cuatro de los cinco regímenes, lo que limita la evidencia de mejora frente a `B0`–`B3`; solo el oráculo `B4` se desvía en `R5`.
- No se documentan intervalos de confianza, número de muestras ni metodología estadística de la comparativa.
- Cobertura limitada a códigos de superficie CSS rotados con `d=3` y `d=5`; no se indica soporte para otras distancias o familias de códigos.
- El repositorio figura con 0,0 GB de tamaño y 0 descargas, por lo que la integridad y reproducibilidad de los artefactos no están verificadas por terceros.
- La licencia MIT permite uso comercial, pero no se especifican patentes ni condiciones adicionales sobre la implementación hardware.
- No se documentan sesgos ni riesgos de alucinación por no tratarse de un modelo generativo; el riesgo principal es de calibración incorrecta de los 21 parámetros de ruido si se aplican a un dispositivo distinto del calibrado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Terrano09/AVID-EPJ-Baseline-Models-and-Data
- No se han encontrado papers, blogs, repositorios de código ni demos adicionales en la información proporcionada.
