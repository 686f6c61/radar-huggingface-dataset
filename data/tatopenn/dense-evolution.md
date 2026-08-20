# Tatopenn/dense-Evolution

## Resumen

Dense Evolution es un simulador de statevector de altas prestaciones diseñado para circuitos NISQ profundos, pipelines VQE y cargas de trabajo de QML. Lo desarrolla Tatopenn (cuenta GitHub `tatopenn-cell`) y se distribuye como paquete Python `dense-evolution`. Su objetivo principal es eliminar el sobrecoste del producto de Kronecker mediante fusión de kernels lineales con segmentación de strides, compilado a través de JAX XLA, manteniendo el uso de memoria en el mínimo teórico de `2ⁿ × 16 bytes`. No se trata de un modelo de aprendizaje automático, sino de una herramienta de simulación cuántica que integra motores de statevector y MPS, compilación, ruido, VQE, corrección de errores cuánticos, química y utilidades para agentes.

El proyecto incluye un dashboard Streamlit estilo Quantum Composer, un kernel local para una aplicación web Composer, un servidor MCP (Model Context Protocol) para interacción con agentes, y puentes de interoperabilidad con Qiskit y PennyLane. La licencia es BSL 1.1 (Business Source License). La versión actual se publicó en junio de 2026 y se actualizó en agosto de 2026, aunque el repositorio en HuggingFace muestra 0 descargas y 0 likes. La documentación completa está disponible en GitHub Pages y se integra en la lista de Awesome Quantum Software.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Simulador de statevector (no es un modelo neuronal) |
| Parámetros totales | No aplica (software de simulación) |
| Parámetros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantización | No aplica |
| Idiomas soportados | No disponible (interfaz en inglés) |
| Licencia | BSL 1.1 (Business Source License) |
| Formato de pesos | No aplica (paquete Python con código fuente) |

## Arquitectura y entrenamiento

Dense Evolution se basa en un motor de simulación de statevector que utiliza segmentación por strides (stride-sliced) para eliminar el producto de Kronecker explícito en la aplicación de compuertas cuánticas. La compilación se realiza mediante JAX XLA, lo que permite fusionar kernels lineales y reducir el uso de memoria al mínimo teórico para un vector de estado de n qubits (`2ⁿ` números complejos de 16 bytes). Incluye soporte para ruido, VQE, QEC y química cuántica. No hay fase de entrenamiento en el sentido de machine learning; el proyecto se desarrolla como una biblioteca de simulación. No se especifican datos de entrenamiento ni técnicas como RLHF o DPO.

## Capacidades

- Simulación de circuitos cuánticos de statevector con alta eficiencia de memoria.
- Motor MPS (Matrix Product State) para sistemas de mayor número de qubits con entrelazamiento limitado.
- Compilación de circuitos mediante JAX XLA y optimización de kernels.
- Simulación con ruido y mitigación de errores (ZNE).
- Implementación de VQE (Variational Quantum Eigensolver) con Hamiltonianos moleculares reales.
- Corrección de errores cuánticos (QEC).
- Cálculo de fuerzas QM/MM y trayectorias de dinámica molecular.
- Interoperabilidad con Qiskit y PennyLane mediante puentes (interop).
- Servidor MCP (Model Context Protocol) para integración con agentes y herramientas de IA.
- Dashboard Streamlit con editor de circuitos tipo Quantum Composer (pestañas de builder, circuito, statevector, probabilidades y Q-sphere).
- Aplicación web Composer con kernel local para VQE, ZNE, química y dinámica molecular.

## Casos de uso

- **Investigación en computación cuántica**: simular circuitos NISQ profundos con hasta ~30 qubits en una GPU estándar (límite por memoria `2^n × 16 bytes`), gracias a la eliminación del producto de Kronecker y la compilación XLA.
- **Desarrollo de algoritmos VQE**: ejecutar pipelines de VQE con Hamiltonianos moleculares reales, con mitigación de errores ZNE, en entornos locales sin necesidad de hardware cuántico.
- **Educación y divulgación**: usar el dashboard Streamlit para construir y visualizar circuitos cuánticos interactivamente, mostrando statevector, probabilidades y Q-sphere.
- **Integración con agentes de IA**: el servidor MCP permite que un agente LLM interactúe con el simulador para diseñar experimentos, ajustar parámetros y analizar resultados de forma autónoma.
- **Desarrollo de algoritmos QML**: el simulador sirve como backend para entrenar modelos de aprendizaje automático cuántico, con soporte para PennyLane y Qiskit.
- **Investigación en corrección de errores**: probar códigos de corrección y esquemas de mitigación de ruido en un entorno simulado con ruido configurable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La documentación del proyecto no incluye métricas de rendimiento comparativas con otros simuladores. Se recomienda consultar la documentación oficial y el repositorio para evaluaciones internas.

## Requisitos de hardware

- **VRAM**: dependiente del número de qubits. Para n qubits, el estado requiere `2^n × 16 bytes`. Por ejemplo, 20 qubits → 16 MB, 25 qubits → 512 MB, 30 qubits → 16 GB.
- **GPU recomendada**: cualquier GPU compatible con JAX (CUDA para NVIDIA, ROCm para AMD, o CPU). Para simulaciones de más de 25 qubits se recomienda GPU con al menos 16 GB de VRAM (A100, RTX 4090, V100).
- **GPU consumer**: sí, RTX 3090/4090 pueden manejar hasta 28-30 qubits dependiendo de la VRAM.
- **Opciones de despliegue**: instalación vía `pip install dense-evolution` o `dense-evolution[full]` para GPU. Soporta ejecución en CPU, GPU (CUDA, ROCm) y TPU mediante JAX.
- **Latencia**: no se proporcionan datos; la latencia depende del número de qubits y del hardware. La compilación JIT de JAX puede añadir un overhead inicial.

## Comparativa con modelos similares

| Característica | Dense Evolution | Qiskit Aer | PennyLane Lightning |
|---|---|---|---|
| Tipo | Simulador statevector + MPS | Simulador statevector + MPS | Simulador statevector (Lightning) |
| Backend | JAX XLA | C++ (OpenMP) | C++ (Kokkos) |
| Interop | Qiskit, PennyLane, MCP | Qiskit nativo | PennyLane nativo |
| Licencia | BSL 1.1 | Apache 2.0 | Apache 2.0 |
| Memoria mínima | `2^n × 16 bytes` | `2^n × 16 bytes` (típico) | `2^n × 16 bytes` |
| Extras | VQE, QEC, química, MCP, dashboard | Ruido, QASM, transpilación | Gradientes automáticos, integración ML |

## Limitaciones y advertencias

- **Licencia BSL 1.1**: es una licencia de fuente disponible, no de código abierto estándar. Aunque permite uso no comercial y comercial bajo ciertas condiciones, puede tener restricciones para uso en producción o redistribución. Se debe revisar el texto completo de la licencia.
- **No es un modelo de IA**: no se debe confundir con un modelo de lenguaje o de generación de texto; no ofrece capacidades de razonamiento o generación de contenido.
- **Dependencia de JAX**: requiere la instalación de JAX, que a su vez puede tener requisitos específicos de hardware y versiones de CUDA.
- **Soporte limitado**: el repositorio tiene 0 descargas y 0 likes en HuggingFace, lo que sugiere una adopción muy temprana y posible falta de comunidad.
- **Errores de compatibilidad**: se documenta un fallo conocido de Qiskit en macOS/arm64 que puede causar segfaults al usar el puente de Qiskit.
- **No se proporcionan garantías de rendimiento**: sin benchmarks publicados, la eficiencia real no está verificada externamente.

## Enlaces

- [Repositorio GitHub](https://github.com/tatopenn-cell/Dense-Evolution)
- [Documentación completa](https://tatopenn-cell.github.io/Dense-Evolution/)
- [PyPI - dense-evolution](https://pypi.org/project/dense-evolution/)
- [DOI Zenodo](https://doi.org/10.5281/zenodo.21855643)
- [HuggingFace - Tatopenn/dense-Evolution](https://huggingface.co/Tatopenn/dense-Evolution)
